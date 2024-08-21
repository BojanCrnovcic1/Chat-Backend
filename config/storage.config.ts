export const StorageConfig = {
    image: {
        destination: '../../Storages/storage/chat/images',
        urlPrefix: '/assets/photos/',
        maxAge: 1000 * 60 * 60 * 24 * 7,
        maxSize: 1024 * 1024 * 300,
    },
    video: {
        destination: '../../Storages/storage/chat/videos',
        urlPrefix: '/assets/videos/',
        maxSize: 1024 * 1024 * 1024 * 2, 
    },
    audio: {
        destination: '../../Storages/storage/chat/audio',
        urlPrefix: '/assets/audio/',
        maxSize: 1024 * 1024 * 100,
    }
}