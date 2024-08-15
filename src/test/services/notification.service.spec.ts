import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from 'src/entities/notification.entity';
import { ApiResponse } from 'src/misc/api.response.class';
import { NotificationService } from 'src/services/notification/notification.service';

describe('NotificationService', () => {
    let service: NotificationService;
    let notificationRepository: Repository<Notification>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotificationService,
                {
                    provide: getRepositoryToken(Notification),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<NotificationService>(NotificationService);
        notificationRepository = module.get<Repository<Notification>>(getRepositoryToken(Notification));
    });

    describe('createNotification', () => {
        it('should create and return a notification', async () => {
            const notification = new Notification();
            notification.userId = 1;
            notification.message = 'Test message';
            notification.isRead = false;

            jest.spyOn(notificationRepository, 'create').mockReturnValue(notification);
            jest.spyOn(notificationRepository, 'save').mockResolvedValue(notification);

            const result = await service.createNotification(1, 'Test message');
            expect(result).toEqual(notification);
        });

        it('should return an error if notification is not created', async () => {
            jest.spyOn(notificationRepository, 'create').mockReturnValue(null);

            const result = await service.createNotification(1, 'Test message');
            expect(result).toEqual(new ApiResponse('error', -5002, 'Notification is not created.'));
        });

        it('should return an error if notification is not saved', async () => {
            const notification = new Notification();
            jest.spyOn(notificationRepository, 'create').mockReturnValue(notification);
            jest.spyOn(notificationRepository, 'save').mockResolvedValue(null);

            const result = await service.createNotification(1, 'Test message');
            expect(result).toEqual(new ApiResponse('error', -5003, 'Notification is not saved.'));
        });
    });

    describe('getNotifications', () => {
        it('should return an array of notifications for a user', async () => {
            const notifications = [new Notification(), new Notification()];
            jest.spyOn(notificationRepository, 'find').mockResolvedValue(notifications);

            const result = await service.getNotifications(1);
            expect(result).toEqual(notifications);
        });
    });

    describe('markAsRead', () => {
        it('should mark a notification as read', async () => {
            const notification = new Notification();
            notification.notificationId = 1;
            notification.isRead = false;

            jest.spyOn(notificationRepository, 'findOne').mockResolvedValue(notification);
            jest.spyOn(notificationRepository, 'save').mockResolvedValue(notification);

            const result = await service.markAsRead(1);
            expect(result).toEqual(new ApiResponse('success', 0, 'Notification marked as read'));
            expect(notification.isRead).toBe(true);
        });

        it('should return an error if notification is not found', async () => {
            jest.spyOn(notificationRepository, 'findOne').mockResolvedValue(null);

            const result = await service.markAsRead(1);
            expect(result).toEqual(new ApiResponse('error', -5001, 'Notification is not found.'));
        });

        it('should return an internal server error on exception', async () => {
            jest.spyOn(notificationRepository, 'findOne').mockRejectedValue(new Error('Test error'));

            const result = await service.markAsRead(1);
            expect(result).toEqual(new ApiResponse('error', -9999, 'Internals server error'));
        });
    });
});
