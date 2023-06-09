import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
} from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { User } from './../model/user';
import { UserService } from './../service/user.service';
import { NotificationService } from './../service/notification.service';
import { NotificationType } from '../enum/notification-type.enum';
import { NgForm } from '@angular/forms';
import { CustomHttpResponse } from '../model/custom-http-response';
import { AuthenticationService } from './../service/authentication.service';
import { Router } from '@angular/router';
import { FileUploadStatus } from '../model/file-upload.status';
import { Role } from '../enum/role.enum';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent implements OnInit, OnDestroy {
  private titleSubject = new BehaviorSubject<string>('Users');
  public titleAction$ = this.titleSubject;
  //titleAction$ va faire un trigger a titleSubject si sa valeur est modifier elle va etre notifier
  //Dispatcher!
  public users: User[] = [];
  public user = new User();
  public refreshing: boolean = false;
  public selectedUser: User | undefined;
  private subscription: Subscription[] = [];
  public profileImage: File | undefined | null;
  public fileName: string | undefined | null;
  public editUser = new User();
  private currentUsername: string | undefined | null;
  public fileStatus = new FileUploadStatus();
  private deleteUsername = '';
  public DefaultGenderToSelect: string = 'Choose_Gender';
  public DefaultRoleToSelect: string = 'Choose_Role';
  public page: number = 0;
  public pages: Array<number> = [];
  public totalUsers: number = 0;
  constructor(
    public userService: UserService,
    private notificationService: NotificationService,
    private authenticationService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getTotalUsers();
    this.user = this.authenticationService.getUserFromLocalCache()!;
    this.getUsersByPage(this.page, true);
  }

  public changeTitle(title: string): void {
    this.titleSubject.next(title);
  }

  public getUsers(showNotification: boolean): void {
    this.refreshing = true;
    this.subscription.push(
      this.userService.getUsers().subscribe(
        (response: User[]) => {
          this.userService.addUsersToLocalCache(response);
          //this.users = response;
          this.refreshing = false;
          if (showNotification) {
            this.sendNotification(
              NotificationType.SUCCESS,
              `${this.page * 10} user(s) loaded successfuly.`
            );
          }
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(
            NotificationType.ERROR,
            errorResponse.error.message
          );
          this.refreshing = false;
        }
      )
    );
  }

  public onSelectUser(selectedUser: User): void {
    this.selectedUser = selectedUser;
    this.clickButton('openUserInfo');
  }

  public onProfileChange(event: any): void {
    console.log('event=', event);
    const inputElement = event.target as HTMLInputElement;
    const fileList = inputElement.files;
    if (fileList && fileList.length > 0) {
      this.profileImage = fileList[0];
      this.fileName = fileList[0].name;
      // Do something with the file, such as upload it to a server
      console.log(
        `Selected file: ${this.fileName}, size: ${this.profileImage.size} bytes`
      );
    }
  }

  public saveNewUser(): void {
    this.clickButton('new-user-save');
  }

  public onAddNewUser(userForm: NgForm): void {
    const formData = this.userService.createUserFormData(
      '',
      userForm.value,
      this.profileImage!
    );
    this.subscription.push(
      this.userService.addUser(formData).subscribe(
        (response: User) => {
          this.clickButton('new-user-close');
          //this.getUsers(false);
          this.getUsersByPage(this.page, true);
          this.fileName = null;
          this.profileImage = null;
          userForm.reset();
          this.sendNotification(
            NotificationType.SUCCESS,
            `${response.firstName} ${response.lastName} added successfuly`
          );
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(
            NotificationType.ERROR,
            errorResponse.error.message
          );
          this.profileImage = null;
        }
      )
    );
  }
  // update user
  public onUpdateUser(): void {
    const formData = this.userService.createUserFormData(
      this.currentUsername!,
      this.editUser,
      this.profileImage!
    );
    this.subscription.push(
      this.userService.updateUser(formData).subscribe(
        (response: User) => {
          this.clickButton('closeEditUserModalButton');
          //this.getUsers(false);
          this.getUsersByPage(this.page, false);
          this.fileName = null;
          this.profileImage = null;
          this.sendNotification(
            NotificationType.SUCCESS,
            `${response.firstName} ${response.lastName} updated successfuly`
          );
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(
            NotificationType.ERROR,
            errorResponse.error.message
          );
          this.profileImage = null;
        }
      )
    );
  }
  public searchUsers(searchTerm: string): void {
    console.log('searchTerm=', searchTerm);
    console.log('**');
    const results: User[] = [];
    for (const user of this.userService.getUsersFromLocalCache()!) {
      if (
        user.firstName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.lastName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.username.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.userId.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.email.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
      ) {
        results.push(user);
      }
    }
    this.users = results;
    if (results.length === 0 || !searchTerm) {
      this.users = this.userService.getUsersFromLocalCache()!;
      this.getUsersByPage(0, false);
    }
  }

  public onUpdateCurrentUser(user: User): void {
    this.refreshing = true;
    this.currentUsername =
      this.authenticationService.getUserFromLocalCache()?.username;
    const formData = this.userService.createUserFormData(
      this.currentUsername!,
      user,
      this.profileImage!
    );
    this.subscription.push(
      this.userService.updateUser(formData).subscribe(
        (response: User) => {
          this.authenticationService.addUserToLocalCache(response);
          //this.getUsers(false);
          this.getUsersByPage(this.page, false);
          this.fileName = null;
          this.profileImage = null;
          this.sendNotification(
            NotificationType.SUCCESS,
            `${response.firstName} ${response.lastName} updated successfuly`
          );
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(
            NotificationType.ERROR,
            errorResponse.error.message
          );
          this.refreshing = true;
          this.profileImage = null;
        },
        () => {
          this.fileStatus.status = 'done';
          this.router
            .navigateByUrl('/login', { skipLocationChange: true })
            .then(() => {
              this.router.navigate(['/user/management']);
            });
        }
      )
    );
  }

  public onUpdateProfileImage(): void {
    const formData = new FormData();
    formData.append('username', this.user.username);
    formData.append('profileImage', this.profileImage!);
    this.subscription.push(
      this.userService.updateProfileImage(formData).subscribe(
        (event: HttpEvent<any>) => {
          console.log(event);
          this.reportUploadProgress(event);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(
            NotificationType.WARNING,
            errorResponse.error.message
          );
          this.fileStatus.status = 'done';
        },
        () => {
          this.fileStatus.status = 'done';
        }
      )
    );
  }

  private reportUploadProgress(event: HttpEvent<any>): void {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        this.fileStatus.percentage = Math.round(
          (100 * event.loaded) / event.total!
        );
        this.fileStatus.status = 'progress';
        break;
      case HttpEventType.Response:
        if (event.status === 200) {
          this.fileStatus.status = 'done';
          this.user.profileImageUrl = `${
            event.body.profileImageUrl
          }?time=${new Date().getTime()}`;
          //this.user.profileImageUrl = `${event.body.profileImageUrl}`;
          this.sendNotification(
            NotificationType.SUCCESS,
            `${event.body.firstName}\'s profile image updated successfuly`
          );
          this.fileStatus.status = 'done';
          this.router.navigate(['/user/management']);
          break;
        } else {
          this.sendNotification(
            NotificationType.ERROR,
            `Unable to upload image. Please try again`
          );
          break;
        }
      default:
        `Finished all process`;
    }
  }

  public updateProfileImage(): void {
    this.clickButton('profile-image-input');
  }

  public onLogOut(): void {
    this.authenticationService.logOut();
    this.router.navigate(['/login']);
    this.sendNotification(
      NotificationType.SUCCESS,
      `You've been successfully logged out`
    );
  }

  public onResetPassword(emailForm: NgForm): void {
    this.refreshing = true;
    const emailAdress = emailForm.value['reset-password-email'];
    this.subscription.push(
      this.userService.resetPassword(emailAdress).subscribe(
        (response: CustomHttpResponse) => {
          this.sendNotification(NotificationType.SUCCESS, response.message);
          this.refreshing = false;
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(
            NotificationType.WARNING,
            errorResponse.error.message
          );
        },
        () => emailForm.reset()
      )
    );
  }

  public buttonPopUpToDelete(): void {
    console.log('Save changes lanced');
    this.subscription.push(
      this.userService.deleteUser(this.deleteUsername).subscribe(
        (response: CustomHttpResponse) => {
          this.sendNotification(NotificationType.SUCCESS, response.message);
          //this.getUsers(false);
          this.getUsersByPage(this.page, true);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(
            NotificationType.ERROR,
            errorResponse.error.message
          );
        }
      )
    );
    this.clickButton('btn-trigger-modal-delete-close');
  }

  public onDeleteUser(username: string): void {
    this.deleteUsername = username;
    this.clickButton('btn-trigger-modal-delete');
  }

  public onEditUser(editUser: User): void {
    this.editUser = editUser;
    this.currentUsername = editUser.username;
    this.clickButton('openUserEdit');
  }

  public get isAdmin(): boolean {
    return (
      this.getUserRole() === Role.ADMIN ||
      this.getUserRole() === Role.SUPER_ADMIN
    );
  }

  public get isSuperAdmin(): boolean {
    return this.getUserRole() === Role.SUPER_ADMIN;
  }

  private getUserRole(): string {
    return this.authenticationService.getUserFromLocalCache()?.role!;
  }

  private sendNotification(
    notificationType: NotificationType,
    message: string
  ): void {
    if (message) {
      this.notificationService.notify(notificationType, message);
    } else {
      this.notificationService.notify(
        notificationType,
        'An error occured. Please try again '
      );
    }
  }

  private clickButton(buttonId: string) {
    document.getElementById(buttonId)?.click();
  }
  public getExtension(): string {
    // Split the input string into an array of substrings based on the dot delimiter
    const lastDotIndex = this.editUser.profileImageUrl.lastIndexOf('.');
    //if (lastDotIndex)
    // Get the last element of the array, which represents the file extension
    const extension = this.editUser.profileImageUrl.substring(lastDotIndex + 1);
    return extension;
  }

  public setPage(i: number, event: any): void {
    event.preventDefault();
    this.page = i;
    this.getUsersByPage(this.page, true);
    if (this.page === this.pages?.length) {
    }
  }

  public getUsersByPage(page: number, showNotification: boolean): void {
    this.getUsers(false);
    this.subscription.push(
      this.userService.getUsersByPage(page).subscribe(
        (response: any) => {
          this.users = response['content'];
          this.pages = new Array(response['totalPages']);

          this.userService.addUsersToLocalCache(this.users);
          //this.totalPages = response.to
          this.refreshing = false;
          if (showNotification && this.users !== undefined) {
            this.sendNotification(
              NotificationType.SUCCESS,
              `${this.users?.length} user(s) loaded successfuly.`
            );
          }
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(
            NotificationType.ERROR,
            errorResponse.error.message
          );
          this.refreshing = false;
        }
      )
    );
  }
  public getTotalUsers(): void {
    this.totalUsers = this.userService.getUsers.length;
    this.subscription.push(
      this.userService.getUsers().subscribe(
        (response: any) => {
          this.totalUsers = response.length;
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(
            NotificationType.ERROR,
            errorResponse.error.message
          );
        }
      )
    );
  }
  ngOnDestroy(): void {
    this.subscription.forEach((sub) => sub.unsubscribe());
  }
}
