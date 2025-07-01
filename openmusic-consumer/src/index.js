const ConsumerService = require('./services/exports/consumerService');

const init = async () => {
  console.log('Consumer service started...');
  await ConsumerService.init();
};

init();
