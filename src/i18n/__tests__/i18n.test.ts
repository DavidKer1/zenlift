import i18n from '@/i18n/i18n';
import { setTestLanguage } from '@/i18n/testing';

describe('i18n initialization', () => {
  it('uses English as the default fallback language', () => {
    expect(i18n.options.fallbackLng).toEqual(['en']);
  });

  it('can switch between English and Spanish resources', async () => {
    await setTestLanguage('en');
    expect(i18n.t('tabs.home')).toBe('Home');

    await setTestLanguage('es');
    expect(i18n.t('tabs.home')).toBe('Inicio');
  });
});
