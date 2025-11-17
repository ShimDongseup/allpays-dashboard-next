const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://recruit.paysbypays.com/api/v1";

type ApiResponse<T> = {
  status: number;
  message: string;
  data: T;
};

type Payment = {
  paymentCode: string;
  mchtCode: string;
  amount: string;
  currency: string;
  payType: string;
  status: string;
  paymentAt: string;
};

type CodeItem = {
  code: string;
  description: string;
};

type PayTypeItem = {
  type: string;
  description: string;
};

const PAGE_SIZE = 15;

// 정렬 기준으로 쓸 수 있는 키들
type SortKey =
  | "paymentCode"
  | "mchtCode"
  | "amount"
  | "payType"
  | "status"
  | "paymentAt";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    sortBy?: string;
    order?: string;
  }>;
}) {
  const sp = await searchParams;

  // 페이지
  const currentPage = (() => {
    const p = Number(sp.page ?? "1");
    if (Number.isNaN(p) || p < 1) return 1;
    return Math.floor(p);
  })();

  // 정렬 기준, 기본값은 결제 시각(paymentAt) 내림차순
  const sortBy: SortKey = (sp.sortBy as SortKey) ?? "paymentAt";
  const order: "asc" | "desc" = sp.order === "asc" ? "asc" : "desc";

  const [paymentsRes, statusRes, typeRes] = await Promise.all([
    fetch(`${BASE_URL}/payments/list`, { cache: "no-store" }),
    fetch(`${BASE_URL}/common/payment-status/all`, { cache: "force-cache" }),
    fetch(`${BASE_URL}/common/paymemt-type/all`, { cache: "force-cache" }),
  ]);

  if (!paymentsRes.ok || !statusRes.ok || !typeRes.ok) {
    throw new Error("거래 내역 데이터 조회에 실패했습니다.");
  }

  const paymentsJson = (await paymentsRes.json()) as ApiResponse<Payment[]>;
  const statusJson = (await statusRes.json()) as ApiResponse<CodeItem[]>;
  const typeJson = (await typeRes.json()) as ApiResponse<PayTypeItem[]>;

  const paymentsAll = paymentsJson.data ?? [];
  const statusCodes = statusJson.data ?? [];
  const payTypes = typeJson.data ?? [];

  const statusMap = new Map(statusCodes.map((s) => [s.code, s.description]));
  const payTypeMap = new Map(payTypes.map((t) => [t.type, t.description]));

  // 정렬
  const sortedPayments = [...paymentsAll].sort((a, b) => {
    const dir = order === "asc" ? 1 : -1;

    let av: number | string = "";
    let bv: number | string = "";

    switch (sortBy) {
      case "paymentCode":
        av = a.paymentCode;
        bv = b.paymentCode;
        break;
      case "mchtCode":
        av = a.mchtCode;
        bv = b.mchtCode;
        break;
      case "amount":
        av = Number(a.amount);
        bv = Number(b.amount);
        break;
      case "payType":
        av = a.payType;
        bv = b.payType;
        break;
      case "status":
        av = a.status;
        bv = b.status;
        break;
      case "paymentAt":
      default:
        av = new Date(a.paymentAt).getTime();
        bv = new Date(b.paymentAt).getTime();
        break;
    }

    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });

  // 페이지네이션
  const totalItems = sortedPayments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const start = (safePage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const payments = sortedPayments.slice(start, end);

  const hasPrev = safePage > 1;
  const hasNext = safePage < totalPages;

  // 정렬 상태 표시용 화살표
  const arrowFor = (key: SortKey) =>
    sortBy === key ? (order === "asc" ? " ▲" : " ▼") : "";

  // 페이지네이션 링크에서 정렬 유지
  const baseQuery = `sortBy=${sortBy}&order=${order}`;

  const buildSortHref = (key: SortKey) => {
    const isCurrent = sortBy === key;
    const nextOrder: "asc" | "desc" =
      isCurrent && order === "asc" ? "desc" : "asc";

    return `/transactions?page=1&sortBy=${key}&order=${nextOrder}`;
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">거래 내역</h1>
        <p className="text-sm text-slate-400">
          결제 거래 목록과 상태/수단 정보를 함께 확인할 수 있는 페이지입니다.
        </p>
      </div>

      {/* 간단 요약 */}
      <div className="w-xl gap-4">
        <div className="rounded-xl border border-slate-800 p-4">
          <div className="text-xs text-slate-400 mb-1">총 거래 건수</div>
          <div className="text-xl font-semibold">
            {totalItems.toLocaleString("ko-KR")}건
          </div>
        </div>
      </div>
      <div className="text-sm px-2 flex justify-end">
        * 테이블의 라벨을 눌러 정렬을 할 수 있습니다.
      </div>
      {/* 거래 목록 테이블 */}
      <div className="rounded-lg border border-slate-800 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/60">
            <tr>
              <th className="px-4 py-2 text-left">
                <a
                  href={buildSortHref("paymentCode")}
                  className="cursor-pointer hover:underline"
                >
                  결제 코드{arrowFor("paymentCode")}
                </a>
              </th>
              <th className="px-4 py-2 text-left">
                <a
                  href={buildSortHref("mchtCode")}
                  className="cursor-pointer hover:underline"
                >
                  가맹점 코드{arrowFor("mchtCode")}
                </a>
              </th>
              <th className="px-4 py-2 text-left">
                <a
                  href={buildSortHref("amount")}
                  className="cursor-pointer hover:underline"
                >
                  금액{arrowFor("amount")}
                </a>
              </th>
              <th className="px-4 py-2 text-left">
                <a
                  href={buildSortHref("payType")}
                  className="cursor-pointer hover:underline"
                >
                  결제 수단{arrowFor("payType")}
                </a>
              </th>
              <th className="px-4 py-2 text-left">
                <a
                  href={buildSortHref("status")}
                  className="cursor-pointer hover:underline"
                >
                  상태{arrowFor("status")}
                </a>
              </th>
              <th className="px-4 py-2 text-left">
                <a
                  href={buildSortHref("paymentAt")}
                  className="cursor-pointer hover:underline"
                >
                  결제 시각{arrowFor("paymentAt")}
                </a>
              </th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.paymentCode} className="border-t border-slate-800">
                <td className="px-4 py-2">{p.paymentCode}</td>
                <td className="px-4 py-2">{p.mchtCode}</td>
                <td className="px-4 py-2">
                  {Number(p.amount).toLocaleString("ko-KR")}원
                </td>
                <td className="px-4 py-2">
                  {payTypeMap.get(p.payType) ?? p.payType}
                </td>
                <td className="px-4 py-2">
                  {statusMap.get(p.status) ?? p.status}
                </td>
                <td className="px-4 py-2">
                  {new Date(p.paymentAt).toLocaleString("ko-KR")}
                </td>
              </tr>
            ))}

            {payments.length === 0 && (
              <tr>
                <td
                  className="px-4 py-4 text-center text-slate-500"
                  colSpan={6}
                >
                  거래 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div>
          페이지 {safePage} / {totalPages}{" "}
          <span className="ml-2">
            (총 {totalItems.toLocaleString("ko-KR")}건)
          </span>
        </div>
        <div className="space-x-2">
          <a
            href={
              hasPrev ? `/transactions?page=${safePage - 1}&${baseQuery}` : "#"
            }
            aria-disabled={!hasPrev}
            className={`inline-flex items-center rounded-md border px-3 py-1.5 ${
              hasPrev
                ? "border-slate-700 hover:bg-slate-800"
                : "border-slate-800 text-slate-600 cursor-not-allowed"
            }`}
          >
            이전
          </a>
          <a
            href={
              hasNext ? `/transactions?page=${safePage + 1}&${baseQuery}` : "#"
            }
            aria-disabled={!hasNext}
            className={`inline-flex items-center rounded-md border px-3 py-1.5 ${
              hasNext
                ? "border-slate-700 hover:bg-slate-800"
                : "border-slate-800 text-slate-600 cursor-not-allowed"
            }`}
          >
            다음
          </a>
        </div>
      </div>
    </div>
  );
}
