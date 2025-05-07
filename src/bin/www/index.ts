import app from '../../server';
import { configVariables } from '../../config/envConfig';
import { errorHandler } from '../../middlewares/errorHandler';
import logger from '../../utils/logger';
const { port } = configVariables.serverConfig




app.use(errorHandler)
const protocol = process.env.NODE_ENV === 'dev' ? 'http' : 'https';
app.listen(port, () => {
  logger.info(`Server listening on ${protocol}://127.0.0.1:${port}`);
})