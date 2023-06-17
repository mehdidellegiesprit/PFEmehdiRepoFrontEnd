import { DonneeExtrait } from './DonneeExtrait';

export class ExtraitBancaire {
  uuid: string; // ajouter un champ pour stocker l'UUID
  dateExtrait: Date;
  dateDuSoldeCrediteurDebutMois: Date;
  creditDuSoldeCrediteurDebutMois: number;
  donneeExtraits: DonneeExtrait[];
  totalMouvementsDebit: number;
  totalMouvementsCredit: number;
  dateDuSoldeCrediteurFinMois: Date;
  creditDuSoldeCrediteurFinMois: number;
  constructor(
    uuid: string, // ajouter un champ pour stocker l'UUID
    dateExtrait: Date,
    dateDuSoldeCrediteurDebutMois: Date,
    creditDuSoldeCrediteurDebutMois: number,
    donneeExtraits: DonneeExtrait[],
    totalMouvementsDebit: number,
    totalMouvementsCredit: number,
    dateDuSoldeCrediteurFinMois: Date,
    creditDuSoldeCrediteurFinMois: number
  ) {
    this.uuid = uuid;
    this.dateExtrait = dateExtrait;
    this.dateDuSoldeCrediteurDebutMois = dateDuSoldeCrediteurDebutMois;
    this.creditDuSoldeCrediteurDebutMois = creditDuSoldeCrediteurDebutMois;
    this.donneeExtraits = donneeExtraits;
    this.totalMouvementsDebit = totalMouvementsDebit;
    this.totalMouvementsCredit = totalMouvementsCredit;
    this.dateDuSoldeCrediteurFinMois = dateDuSoldeCrediteurFinMois;
    this.creditDuSoldeCrediteurFinMois = creditDuSoldeCrediteurFinMois;
  }
}
