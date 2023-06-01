export class User {
  public id: number;
  public userId: string;
  public firstName: string;
  public lastName: string;
  public username: string;
  public email: string;
  public logInDateDisplay: Date;
  public joinDate: Date;
  public profileImageUrl: string;
  public active: boolean; // the same as isEnabled
  public notLocked: boolean;
  public role: string; // ROLE_USER / ROLE_ADMIN
  public authorities: []; // delete, read, update..
  public lastLoginDateDisplay: Date;
  public phoneNumber: string;
  public gender: string;

  constructor() {
    this.id = 0;
    this.userId = '';
    this.firstName = '';
    this.lastName = '';
    this.username = '';
    this.email = '';
    this.logInDateDisplay = new Date();
    this.joinDate = new Date();
    this.profileImageUrl = '';
    this.active = false;
    this.notLocked = false;
    this.role = '';
    this.authorities = [];
    this.lastLoginDateDisplay = new Date();
    this.phoneNumber = '';
    this.gender = '';
  }
}
