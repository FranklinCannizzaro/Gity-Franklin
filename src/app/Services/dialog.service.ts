import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MessageDialogComponent } from "../components/dialogs/message-dialog/message-dialog.component";
import { DataService } from "./data.service";
import { EMPTY, Observable } from "rxjs";

@Injectable()
export class DialogService {
    constructor(private dialog: MatDialog, private dataService: DataService) { }

    handleError(error: any, errorMessage: string): Observable<any> {
        if (error.status === 401) {
            this.dataService.clearUserDetails();
            this.openMessageDialog('Error', 'Session expired, please login again.').subscribe(() => window.location.href = '#/login');
            return EMPTY;
        }else{
            return this.openMessageDialog('Error', errorMessage);
        }
    }

    openMessageDialog(header: string, body: string): Observable<any> {
        this.dataService.updateProgressBarSubject(false);
        this.dataService.updateProgressBarSubjectForSlider(false);
        const dialogRef = this.dialog.open(MessageDialogComponent, {
            data: { header: header, content: body }
        });
        return dialogRef.afterClosed();
    }

    openMessageDialogWithSize(header: string, body: string, width: string, height: string) {
        this.dataService.updateProgressBarSubject(false);
        this.dataService.updateProgressBarSubjectForSlider(false);
        const dialogRef = this.dialog.open(MessageDialogComponent, {
            width: width, height: height,
            data: { header: header, content: body }
        });
        return dialogRef.afterClosed();
    }

}