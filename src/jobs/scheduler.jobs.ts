import cron from 'node-cron';
import WorkerService from '../services/others/worker.service';
import logger from '../utils/logger';

// Every day at 11PM
cron.schedule('0 23 * * *', async () => {
    logger.info('Running Daily 11pm inactiveApplicants  check worker...');
    await WorkerService.inactiveApplicants();
});

// Every Wednesday at 11PM
cron.schedule('0 23 * * 3', async () => {
    logger.info('Running Wednesday 11pm notActivatedApplicants worker...');
    await WorkerService.notActivatedApplicants();
});
