import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { DollarSign, Users, TrendingUp, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { z } from "zod";
import FinancialFileUpload from "./FinancialFileUpload";

const calculatorSchema = z.object({
  revenue: z.number().min(1, "Revenue must be greater than 0").max(1000000000, "Please enter a valid revenue"),
  costs: z.number().min(0, "Costs cannot be negative").max(1000000000, "Please enter valid costs"),
  customers: z.number().int().min(1, "Must have at least 1 customer").max(10000000, "Please enter a valid number"),
  avgOrderValue: z.number().min(0.01, "Must be greater than 0").max(1000000, "Please enter a valid value"),
});

interface ProfitCalculatorProps {
  onSubmit: (data: CalculatorData) => void;
  onFileUploadSuccess?: (data: CalculatorData) => void;
}

export interface CalculatorData {
  revenue: number;
  costs: number;
  customers: number;
  avgOrderValue: number;
}

const inputFields = [
  {
    id: "revenue",
    label: "Monthly Revenue",
    icon: DollarSign,
    placeholder: "50,000",
    prefix: "$",
  },
  {
    id: "costs",
    label: "Monthly Costs",
    icon: TrendingUp,
    placeholder: "35,000",
    prefix: "$",
  },
  {
    id: "customers",
    label: "Active Customers",
    icon: Users,
    placeholder: "250",
    prefix: "",
  },
  {
    id: "avgOrderValue",
    label: "Avg Order Value",
    icon: Package,
    placeholder: "200",
    prefix: "$",
  },
];

const ProfitCalculator = ({ onSubmit, onFileUploadSuccess }: ProfitCalculatorProps) => {
  const [values, setValues] = useState<Record<string, string>>({
    revenue: "",
    costs: "",
    customers: "",
    avgOrderValue: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileParsed = useCallback((data: Record<string, unknown>) => {
    // Format data to match CalculatorData type
    const formattedData: CalculatorData = {
      revenue: Number(data.revenue) || 0,
      costs: Number(data.costs) || 0,
      customers: Number(data.customers) || 0,
      avgOrderValue: Number(data.avgOrderValue) || 0,
    };

    // If onFileUploadSuccess is provided and we have valid data, trigger analysis flow
    if (onFileUploadSuccess && (formattedData.revenue > 0 || formattedData.costs > 0)) {
      onFileUploadSuccess(formattedData);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Otherwise, just auto-fill the form fields
    const parsedValues: Record<string, string> = {};
    if (data.revenue !== undefined) parsedValues.revenue = String(data.revenue);
    if (data.costs !== undefined) parsedValues.costs = String(data.costs);
    if (data.customers !== undefined) parsedValues.customers = String(data.customers);
    if (data.avgOrderValue !== undefined) parsedValues.avgOrderValue = String(data.avgOrderValue);
    
    setValues((prev) => ({ ...prev, ...parsedValues }));
    setErrors({});
  }, [onFileUploadSuccess]);

  const handleChange = (field: string, value: string) => {
    // Only allow numbers and decimals
    const sanitized = value.replace(/[^0-9.]/g, "");
    setValues((prev) => ({ ...prev, [field]: sanitized }));
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      revenue: parseFloat(values.revenue) || 0,
      costs: parseFloat(values.costs) || 0,
      customers: parseInt(values.customers) || 0,
      avgOrderValue: parseFloat(values.avgOrderValue) || 0,
    };

    const result = calculatorSchema.safeParse(data);

    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    onSubmit(data);
  };

  return (
    <section id="calculator" className="py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Calculate Your{" "}
              <span className="gradient-text">Profit Potential</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Enter your business metrics below to get your personalized analysis.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card variant="glass" className="p-8 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <FinancialFileUpload onDataParsed={handleFileParsed} />
                
                <div className="relative flex items-center gap-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">or enter manually</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {inputFields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.1 + index * 0.1 }}
                      className="space-y-2"
                    >
                      <label
                        htmlFor={field.id}
                        className="flex items-center gap-2 text-sm font-medium text-foreground"
                      >
                        <field.icon className="w-4 h-4 text-primary" />
                        {field.label}
                      </label>
                      <div className="relative">
                        {field.prefix && (
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {field.prefix}
                          </span>
                        )}
                        <Input
                          id={field.id}
                          type="text"
                          inputMode="decimal"
                          placeholder={field.placeholder}
                          value={values[field.id]}
                          onChange={(e) => handleChange(field.id, e.target.value)}
                          className={`${field.prefix ? "pl-8" : ""} ${
                            errors[field.id] ? "border-destructive focus:ring-destructive/20" : ""
                          }`}
                        />
                      </div>
                      {errors[field.id] && (
                        <p className="text-xs text-destructive">{errors[field.id]}</p>
                      )}
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="pt-4"
                >
                  <Button type="submit" variant="hero" size="lg" className="w-full group">
                    Analyze My Business
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>

                <p className="text-center text-xs text-muted-foreground">
                  Your data is encrypted and never shared. See our{" "}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProfitCalculator;
