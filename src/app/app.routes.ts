import { Routes } from '@angular/router';
import { AuthGuard } from './Services/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { ResetPasswordComponent } from './components/resetPassword/reset-password.component';
import { HomeComponent } from './components/home/home.component';

// New DentalHub components
import { HubDashboardComponent } from './components/hub-dashboard/hub-dashboard.component';
import { DesignerHubComponent } from './components/designer-hub/designer-hub.component';

// Existing components
import { CreateTaskDemoComponent } from './components/create-task-demo/create-task-demo.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskDetailsComponent } from './components/task-details/task-details.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { EditUserComponent } from './components/edit-user/edit-user.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { AdminComponent } from './components/admin/admin.component';
import { ThreeDModelViewerComponent } from './components/three-dmodel-viewer/three-dmodel-viewer.component';
import { DesignerListComponent } from './components/designer-list/designer-list.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { SuccessPageComponent } from './components/task-list/success-page/success-page.component';

export const routes: Routes = [
  { path: 'login',  component: LoginComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'reset',  component: ResetPasswordComponent },
  { path: 'model',  component: ThreeDModelViewerComponent },
  { path: 'user/:id', component: UserProfileComponent },

  {
    path: '', component: HomeComponent, canActivate: [AuthGuard], children: [
      // NEW: Modern Hub Dashboard (replaces old dashboard)
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: HubDashboardComponent },

      // NEW: Designer Uber-View
      { path: 'designer-hub', component: DesignerHubComponent },

      // Existing routes
      { path: 'admin',            component: AdminComponent },
      { path: 'change-password',  component: ChangePasswordComponent },
      { path: 'user-profile',     component: UserProfileComponent },
      { path: 'edit-user',        component: EditUserComponent },
      { path: 'edit-user/:id',    component: EditUserComponent },
      { path: 'user-list',        component: UserListComponent },
      { path: 'designer-list',    component: DesignerListComponent },
      { path: 'task-list/:status', component: TaskListComponent },
      { path: 'notifications',    component: NotificationsComponent },
      { path: 'task-details',     component: TaskDetailsComponent },
      { path: 'create-task-demo', component: CreateTaskDemoComponent },
      { path: 'payment-success',  component: SuccessPageComponent },
    ]
  },
  { path: '**', redirectTo: '/login' }
];
