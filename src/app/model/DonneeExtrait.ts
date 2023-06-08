export class DonneeExtrait {
  dateDonneeExtrait: Date;
  dateValeurDonneeExtrait: Date;
  operations: string;
  debit: number;
  credit: number;
  isExpanded?: boolean;
  testLine?: string;
  isSupplementary: boolean; // Nouveau champ
  constructor(
    dateDonneeExtrait: Date,
    dateValeurDonneeExtrait: Date,
    operations: string,
    debit: number,
    credit: number
  ) {
    this.dateDonneeExtrait = dateDonneeExtrait;
    this.dateValeurDonneeExtrait = dateValeurDonneeExtrait;
    this.operations = operations;
    this.debit = debit;
    this.credit = credit;
  }
}
