import { Routes } from '@angular/router';
import { CreateTaskComponent } from './components/create-task/create-task.component';
import { DashBoardComponent } from './components/dash-board/dash-board.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './Services/auth.guard';
import { TaskListComponent } from './components/task-list/task-list.component';
import { HomeComponent } from './components/home/home.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { CreateTaskDemoComponent } from './components/create-task-demo/create-task-demo.component';
import { SuccessPageComponent } from './components/task-list/success-page/success-page.component';
import { ResetPasswordComponent } from './components/resetPassword/reset-password.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { EditUserComponent } from './components/edit-user/edit-user.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { UserTestComponent } from './components/user-test/user-test.component';
import { AdminComponent } from './components/admin/admin.component';
import { ThreeDModelViewerComponent } from './components/three-dmodel-viewer/three-dmodel-viewer.component';
import { DesignerListComponent } from './components/designer-list/designer-list.component';
import { TaskDetailsComponent } from './components/task-details/task-details.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
// import { UserTestComponent } from './components/user-test/user-test.component';

// use sign-up and resetpassword as dialog

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignUpComponent },
    { path: 'reset', component: ResetPasswordComponent },
    { path: 'model', component: ThreeDModelViewerComponent },
    { path: 'user/:id', component: UserProfileComponent }, // Move this outside the children array

    {
        path: '', component: HomeComponent, canActivate: [AuthGuard], children: [
            { path: 'admin', component: AdminComponent },
            { path: 'change-password', component: ChangePasswordComponent },
            { path: 'user-test', component: UserTestComponent },
            { path: 'user-profile', component: UserProfileComponent },
            { path: 'edit-user', component: EditUserComponent },
            { path: 'user-list', component: UserListComponent },
            { path: 'edit-user/:id', component: EditUserComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashBoardComponent },
            { path: 'designer-list', component: DesignerListComponent },
            { path: 'task-list/:status', component: TaskListComponent },
            { path: 'notifications', component: NotificationsComponent },
            { path: 'task-details', component: TaskDetailsComponent },
            { path: 'create-task-demo', component: CreateTaskDemoComponent },
            { path: 'create-task', component: CreateTaskComponent },
            { path: 'payment-success', component: SuccessPageComponent }
        ]
    },
    { path: '**', redirectTo: '/login' }
];
