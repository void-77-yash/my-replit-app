import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCcw } from "lucide-react";
import { formatIndianCurrency } from "@/lib/utils/format";
import { calculateTotalAmount } from "@/lib/utils/calculations";

const formSchema = z.object({
  netWeight: z.string().min(1, "Net weight is required").transform(Number),
  goldRate: z.string().min(1, "Gold rate is required").transform(Number),
  makingCharges: z.string().min(1, "Making charges are required").transform(Number),
  caratType: z.string()
});

export default function Calculator() {
  const [results, setResults] = useState<{
    makingAmount: number;
    gstAmount: number;
    totalAmount: number;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      netWeight: "",
      goldRate: "",
      makingCharges: "",
      caratType: "24"
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { totalAmount, makingAmount, gstAmount } = calculateTotalAmount({
      netWeight: values.netWeight,
      goldRate: values.goldRate,
      makingCharges: values.makingCharges
    });

    setResults({
      makingAmount,
      gstAmount,
      totalAmount
    });
  }

  function resetForm() {
    form.reset();
    setResults(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-amber-600">
            Gold Rate Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="caratType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carat Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select carat" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="24">24 Carat</SelectItem>
                          <SelectItem value="22">22 Carat</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goldRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gold Rate (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter rate" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="netWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Net Weight (grams)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter weight" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="makingCharges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Making Charges (%)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter charges" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700">
                  Calculate
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="w-10 h-10 p-0"
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </div>

              {results && (
                <div className="space-y-2 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Making Amount: ₹{formatIndianCurrency(results.makingAmount)}
                  </p>
                  <p className="text-sm text-gray-600">
                    GST (3%): ₹{formatIndianCurrency(results.gstAmount)}
                  </p>
                  <p className="text-xl font-semibold text-amber-600">
                    Total Amount: ₹{formatIndianCurrency(results.totalAmount)}
                  </p>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
