import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Triggers a test payload or syncs scheme recommendations to the user's n8n webhook URL.
 * 
 * @param {string} webhookUrl The n8n Webhook URL to call.
 * @param {object} payload The payload containing user demographics and matched schemes.
 * @returns {Promise<object>} Response status and messages.
 */
export async function triggerN8nWebhook(webhookUrl, payload) {
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    throw new Error('Please provide a valid HTTP/HTTPS n8n Webhook URL.');
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source: 'SchemeLens Omnichannel Dispatcher',
      timestamp: new Date().toISOString(),
      ...payload
    }),
  });

  if (!response.ok) {
    throw new Error(`n8n Webhook returned status code: ${response.status}`);
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    return { message: 'Webhook triggered successfully.', rawResponse: text };
  }
}

/**
 * Saves delivery settings for a user in Supabase.
 */
export async function saveDeliverySettings(userId, settings) {
  if (!isSupabaseConfigured) {
    // Return mock success if database is not configured (development ease)
    return { success: true, message: 'Settings saved locally.' };
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      whatsapp_enabled: settings.whatsappEnabled,
      whatsapp_number: settings.whatsappNumber,
      telegram_enabled: settings.telegramEnabled,
      telegram_chat_id: settings.telegramChatId,
      email_alerts_enabled: settings.emailAlertsEnabled,
      n8n_webhook_url: settings.n8nWebhookUrl,
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
  return { success: true, data };
}
