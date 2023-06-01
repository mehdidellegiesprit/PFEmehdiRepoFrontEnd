import { ExtraitBancaire } from './ExtraitBancaire';

export class ReleveBancaire {
  id: string;
  nomBank: string;
  id_societe: string;
  extraits: ExtraitBancaire[];
  iban: string;
  nameFile: string;
  dataFileContent: string;
  constructor(
    id: string,
    nomBank: string,
    id_societe: string,
    iban: string,
    nameFile: string,
    dataFileContent: string
  ) {
    this.id = id;
    this.nomBank = nomBank;
    this.id_societe = id_societe;
    this.extraits = [];
    this.iban = iban;
    this.nameFile = nameFile;
    this.dataFileContent = dataFileContent;
  }
}
