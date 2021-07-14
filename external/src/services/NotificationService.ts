
export enum NotificationType {
    Create = 'Created',
    Update = 'Updated',
    Delete = 'Deleted',
    AttachAdd = 'Attachment Added',
    CommentAdd = 'Comment Added',
    AppSettingsChanged = 'Application Settings Changed'
}

export class NotificationService {
    private static listeners: Array<() => Promise<void>> = [];

    public static RegisterProductListener(callback: () => Promise<void>): void {
        this.listeners.push(callback);
    }

    public static UnRegisterProductListener(callback: () => void): void {
        this.listeners = this.listeners.filter(f => f !== callback);
    }

    public static Notify(notificationType: NotificationType, message?: string, extraMsg?: string): void {
        this.listeners.forEach(l => l.call(l, notificationType.toString(), message, extraMsg));
    }
}
