import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const buyBoxFormSchema = z.object({
  minCashOnCashReturn: z.coerce.number().min(0, "Must be a positive number").max(100, "Cannot exceed 100%"),
  minCapRate: z.coerce.number().min(0, "Must be a positive number").max(100, "Cannot exceed 100%"),
  yearBuiltThreshold: z.coerce.number().min(1800, "Invalid year").max(new Date().getFullYear(), "Cannot be in the future"),
  targetHoldPeriod: z.coerce.number().min(1, "Hold period must be at least 1 year").max(50, "Cannot exceed 50 years"),
});

type BuyBoxFormData = z.infer<typeof buyBoxFormSchema>;

interface BuyBoxFormProps {
  onSubmit: (data: BuyBoxFormData) => void;
  defaultValues?: Partial<BuyBoxFormData>;
}

export default function BuyBoxForm({ onSubmit, defaultValues }: BuyBoxFormProps) {
  const form = useForm<BuyBoxFormData>({
    resolver: zodResolver(buyBoxFormSchema),
    defaultValues: {
      minCashOnCashReturn: 8.0,
      minCapRate: 5.5,
      yearBuiltThreshold: 1980,
      targetHoldPeriod: 5,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form id="buybox-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          <FormField
            control={form.control}
            name="minCashOnCashReturn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Cash-on-Cash Return</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="8.0" {...field} className="pr-8" />
                  </FormControl>
                  <span className="absolute right-3 top-2 text-neutral-400">%</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="minCapRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Cap Rate</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input type="number" step="0.1" placeholder="5.5" {...field} className="pr-8" />
                  </FormControl>
                  <span className="absolute right-3 top-2 text-neutral-400">%</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="yearBuiltThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year Built Threshold</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1980" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="targetHoldPeriod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Hold Period</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input type="number" placeholder="5" {...field} className="pr-12" />
                  </FormControl>
                  <span className="absolute right-3 top-2 text-neutral-400">years</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
