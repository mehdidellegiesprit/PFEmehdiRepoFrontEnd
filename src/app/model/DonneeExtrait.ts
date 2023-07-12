export class DonneeExtrait {
  uuid: string; // ajouter un champ pour stocker l'UUID
  dateDonneeExtrait: Date;
  dateValeurDonneeExtrait: Date;
  operations: string;
  debit: number;
  credit: number;
  factures: string[]; // Nouveau champ
  commentairesFactures: { [key: string]: string }; // Nouveau champ
  valide: boolean; // Nouveau champ
  associationTitreUrl: { [key: string]: string | null }; // Nouveau champ
  constructor(
    uuid: string, // ajouter un champ pour stocker l'UUID
    dateDonneeExtrait: Date,
    dateValeurDonneeExtrait: Date,
    operations: string,
    debit: number,
    credit: number,
    factures?: string[],
    commentairesFactures?: { [key: string]: string },
    associationTitreUrl?: { [key: string]: string | null },
    valide?: boolean
  ) {
    this.uuid = uuid;
    this.dateDonneeExtrait = dateDonneeExtrait;
    this.dateValeurDonneeExtrait = dateValeurDonneeExtrait;
    this.operations = operations;
    this.debit = debit;
    this.credit = credit;
    this.factures = factures || [];
    this.commentairesFactures = commentairesFactures || {};
    this.associationTitreUrl = associationTitreUrl || {};
    this.valide = valide || false;
  }
}
