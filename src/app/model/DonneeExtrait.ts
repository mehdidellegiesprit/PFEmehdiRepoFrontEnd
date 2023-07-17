export class DonneeExtrait {
  uuid: string;
  dateDonneeExtrait: Date;
  dateValeurDonneeExtrait: Date;
  operations: string;
  debit: number;
  credit: number;
  factures: string[];
  commentairesFactures: { [key: string]: string };
  valide: boolean;
  associationTitreUrl: { [key: string]: string | null };
  editing?: boolean; // Ajoutez cette ligne pour définir la propriété 'editing'
  voirPlus: boolean;
  constructor(
    uuid: string,
    dateDonneeExtrait: Date,
    dateValeurDonneeExtrait: Date,
    operations: string,
    debit: number,
    credit: number,
    factures?: string[],
    commentairesFactures?: { [key: string]: string },
    associationTitreUrl?: { [key: string]: string | null },
    valide?: boolean,
    editing?: boolean // Ajoutez cette ligne pour le constructeur
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
    this.editing = editing || false; // Ajoutez cette ligne pour initialiser 'editing'
  }
}
