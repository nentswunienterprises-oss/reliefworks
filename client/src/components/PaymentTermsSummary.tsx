import type { PaymentTermsType } from "@shared/schema";

import { cn } from "@/lib/utils";

type PaymentTermsSummaryProps = {
  paymentTermsType: PaymentTermsType;
  depositPercentage?: number | null;
  paymentTermsNote?: string | null;
  className?: string;
};

export function getPaymentTermsLabel(
  paymentTermsType: PaymentTermsType,
  depositPercentage?: number | null,
) {
  switch (paymentTermsType) {
    case "full_upfront":
      return "100% upfront before work begins";
    case "split_50_50":
      return `${depositPercentage ?? 50}% upfront, balance on completion`;
    case "milestone":
      return "Milestone-based billing";
    case "retainer":
      return "Recurring retainer billing";
    case "custom":
      return "Custom payment arrangement";
    default:
      return "Payment terms defined in the commercial document";
  }
}

export function PaymentTermsSummary({
  paymentTermsType,
  depositPercentage,
  paymentTermsNote,
  className,
}: PaymentTermsSummaryProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-foreground">
        {getPaymentTermsLabel(paymentTermsType, depositPercentage)}
      </p>
      {paymentTermsNote ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{paymentTermsNote}</p>
      ) : null}
    </div>
  );
}
