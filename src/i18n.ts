import { getRequestConfig } from 'next-intl/server';
import ptMessages from './messages/pt.json';

export default getRequestConfig(async () => {
  return {
    locale: 'pt',
    messages: ptMessages
  };
});
