import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertInquirySchema, type InsertInquiry } from "@shared/schema";
import { useCreateInquiry } from "@/hooks/use-inquiries";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";

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
        <h3 className="font-display text-2xl text-primary mb-2">The Client Diagnosis System</h3>
        <p className="text-muted-foreground text-sm">
          Precision is the first step towards relief. Tell us where the weight lies.
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
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" className="bg-background border-border/50 focus:border-primary/50 transition-colors h-12" {...field} />
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
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="john@company.com" className="bg-background border-border/50 focus:border-primary/50 transition-colors h-12" {...field} />
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
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Company (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Inc." className="bg-background border-border/50 focus:border-primary/50 transition-colors h-12" {...field} value={field.value || ''} />
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
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Role (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Founder, CTO, etc." className="bg-background border-border/50 focus:border-primary/50 transition-colors h-12" {...field} value={field.value || ''} />
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
                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Where do you feel the pressure?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 bg-background border-border/50 focus:border-primary/50">
                      <SelectValue placeholder="Select a diagnosis area" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Friction">Friction — Things feel heavy and slow</SelectItem>
                    <SelectItem value="Limitation">Limitation — Is this idea even possible?</SelectItem>
                    <SelectItem value="Incoherence">Incoherence — We don't feel like ourselves</SelectItem>
                    <SelectItem value="Other">Other — Something else entirely</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Context</FormLabel>
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
