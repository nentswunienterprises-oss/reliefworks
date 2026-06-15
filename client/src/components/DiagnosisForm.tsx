import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInquirySchema, type InsertInquiry } from "@shared/schema";
import { useCreateInquiry } from "@/hooks/use-inquiries";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const pressureOptions = [
  { value: "Friction", label: "Friction - Things feel heavy and slow" },
  {
    value: "Limitation",
    label: "Limitation - Is this idea even possible?",
  },
  {
    value: "Incoherence",
    label: "Incoherence - We don't feel like ourselves",
  },
  { value: "Other", label: "Other - Something else entirely" },
] as const;

export function DiagnosisForm() {
  const { mutate, isPending } = useCreateInquiry();

  const form = useForm<InsertInquiry>({
    resolver: zodResolver(insertInquirySchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      role: "",
      pressureType: "",
      message: "",
    },
  });

  function onSubmit(data: InsertInquiry) {
    mutate(data, {
      onSuccess: () => form.reset(),
    });
  }

  return (
    <div className="bg-white rounded-none border border-border/50 p-8 md:p-12 shadow-sm">
      <div className="mb-8">
        <h3 className="font-display text-2xl text-primary mb-2">
          The Client Diagnosis System
        </h3>
        <p className="text-muted-foreground text-sm">
          Precision is the first step towards relief. Tell us where the weight
          lies.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      className="bg-background border-border/50 focus:border-primary/50 transition-colors h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john@company.com"
                      className="bg-background border-border/50 focus:border-primary/50 transition-colors h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                    Company (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Acme Inc."
                      className="bg-background border-border/50 focus:border-primary/50 transition-colors h-12"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                    Role (Optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Founder, CTO, etc."
                      className="bg-background border-border/50 focus:border-primary/50 transition-colors h-12"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="pressureType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                  Where do you feel the pressure?
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid grid-cols-1 gap-3 md:grid-cols-2"
                  >
                    {pressureOptions.map((option) => {
                      const isSelected = field.value === option.value;

                      return (
                        <label
                          key={option.value}
                          className={cn(
                            "flex min-h-[88px] cursor-pointer items-start gap-3 rounded-md border px-4 py-4 transition-colors",
                            "bg-background text-foreground",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-border/50 hover:border-primary/40"
                          )}
                        >
                          <RadioGroupItem
                            value={option.value}
                            className="mt-1 shrink-0"
                          />
                          <span className="text-sm leading-relaxed">
                            {option.label}
                          </span>
                        </label>
                      );
                    })}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                  Context
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the situation briefly..."
                    className="min-h-[120px] bg-background border-border/50 focus:border-primary/50 transition-colors resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isPending}
            className="w-full md:w-auto h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium tracking-wide flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Request Relief
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
