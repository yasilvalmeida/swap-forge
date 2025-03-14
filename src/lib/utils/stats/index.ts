import axios from 'axios';

export const updateStats = async (walletAddress: string) => {
  try {
    await axios.post('/api/stats-update', {
      walletAddress,
    });
  } catch (error) {
    console.log('error-stats-update', error);
  }
};

export const getStats = async () => {
  try {
    const list = await axios.get('/api/stats-list');
    return list;
  } catch (error) {
    console.log('error-stats-list', error);
  }
};
