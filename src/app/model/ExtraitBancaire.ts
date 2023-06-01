import { DonneeExtrait } from "./DonneeExtrait";

export class ExtraitBancaire {
  dateExtrait: Date;
  dateDuSoldeCrediteurDebutMois: Date;
  creditDuSoldeCrediteurDebutMois: number;
  donneeExtraits: DonneeExtrait[];
  totalMouvementsDebit: number;
  totalMouvementsCredit: number;
  dateDuSoldeCrediteurFinMois: Date;
  creditDuSoldeCrediteurFinMois: number;
  constructor(
    dateExtrait: Date,
    dateDuSoldeCrediteurDebutMois: Date,
    creditDuSoldeCrediteurDebutMois: number,
    donneeExtraits: DonneeExtrait[],
    totalMouvementsDebit: number,
    totalMouvementsCredit: number,
    dateDuSoldeCrediteurFinMois: Date,
    creditDuSoldeCrediteurFinMois: number
  ) {
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
