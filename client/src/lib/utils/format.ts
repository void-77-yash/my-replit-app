export function formatIndianCurrency(number: number): string {
  const roundedNumber = Math.round(number);
  const numStr = roundedNumber.toString();
  const parts = [];
  
  // Handle the last 3 digits
  const lastThree = numStr.slice(-3);
  let remaining = numStr.slice(0, -3);
  
  // Add the last 3 digits
  if (lastThree) {
    parts.unshift(lastThree);
  }
  
  // Handle the rest of the digits in groups of 2
  while (remaining.length > 0) {
    parts.unshift(remaining.slice(-2));
    remaining = remaining.slice(0, -2);
  }
  
  return parts.join(',');
}
