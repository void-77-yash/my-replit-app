interface CalculationParams {
  netWeight: number;
  goldRate: number;
  makingCharges: number;
}

interface CalculationResult {
  makingAmount: number;
  gstAmount: number;
  totalAmount: number;
}

export function calculateTotalAmount(params: CalculationParams): CalculationResult {
  const { netWeight, goldRate, makingCharges } = params;
  
  // Calculate base rate
  const baseRate = netWeight * goldRate;
  
  // Calculate making charges
  const makingAmount = baseRate * (makingCharges / 100);
  
  // Calculate subtotal before GST
  const subtotal = baseRate + makingAmount;
  
  // Calculate GST (3%)
  const gstAmount = subtotal * 0.03;
  
  // Calculate final amount (including ₹200 additional charge as per original code)
  const totalAmount = subtotal + gstAmount + 200;
  
  return {
    makingAmount,
    gstAmount,
    totalAmount
  };
}
