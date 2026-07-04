export interface MedicineDetails {
  manufacturer: string;
  saltComposition: string;
  prescriptionRequirement: string;
  overview: string;
  usefulFor?: string;
  uses: string;
  sideEffects: string;
  precautions: string;
  composition: string;
  warnings: string;
}

export interface ScanResult {
  id: string;
  medicineName: string;
  status: 'Real' | 'Fake' | 'Unknown';
  confidence: number;
  batchNumber: string;
  timestamp: Date | string;
  details: string;
  imageUrl?: string;
  fullDetails?: MedicineDetails;
}

export interface Stats {
  total: number;
  real: number;
  fake: number;
  accuracy: number;
}
