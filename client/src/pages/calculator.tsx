import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { formatIndianCurrency } from "@/lib/utils/format";
import { calculateTotalAmount } from "@/lib/utils/calculations";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Calculation } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

const formSchema = z.object({
  netWeight: z.string().min(1, "Net weight is required").transform(Number),
  goldRate: z.string().min(1, "Gold rate is required").transform(Number),
  makingCharges: z.string().min(1, "Making charges are required").transform(Number),
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
    }
  });

  const queryClient = useQueryClient();

  // Query for fetching calculation history
  const { data: calculations } = useQuery<Calculation[]>({
    queryKey: ["/api/calculations"],
  });

  // Mutation for saving calculations
  const saveCalculation = useMutation({
    mutationFn: async (data: {
      netWeight: number;
      goldRate: number;
      makingCharges: number;
      makingAmount: number;
      gstAmount: number;
      totalAmount: number;
    }) => {
      await apiRequest("POST", "/api/calculations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calculations"] });
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
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

    // Save calculation to history with explicitly typed numeric values
    await saveCalculation.mutateAsync({
      netWeight: Number(values.netWeight),
      goldRate: Number(values.goldRate),
      makingCharges: Number(values.makingCharges),
      makingAmount: Number(makingAmount),
      gstAmount: Number(gstAmount),
      totalAmount: Number(totalAmount)
    });
  }

  function resetForm() {
    const currentValues = form.getValues();
    form.reset({
      netWeight: "",
      goldRate: currentValues.goldRate,
      makingCharges: currentValues.makingCharges
    });
    setResults(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calculator Card */}
        <Card className="shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-amber-600">
              Gold Rate Calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

        {/* History Card */}
        <Card className="shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-amber-600">
              Calculation History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {calculations?.map((calc) => (
                <div key={calc.id} className="p-4 border rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p>Weight: {Number(calc.netWeight).toFixed(2)}g</p>
                    <p>Rate: ₹{formatIndianCurrency(Number(calc.goldRate))}</p>
                    <p>Making: {Number(calc.makingCharges).toFixed(2)}%</p>
                    <p>GST: ₹{formatIndianCurrency(Number(calc.gstAmount))}</p>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-amber-600">
                    Total: ₹{formatIndianCurrency(Number(calc.totalAmount))}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(calc.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}