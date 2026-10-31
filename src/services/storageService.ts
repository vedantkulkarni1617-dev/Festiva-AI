import { EventRecord } from '../types';
import { GRAND_WEDDING_DEMO } from '../data/demoEvents';

const STORAGE_KEY_EVENTS = 'festiva_ai_events_v1';
const STORAGE_KEY_ACTIVE_ID = 'festiva_ai_active_event_id';
const STORAGE_KEY_APP_CURRENCY = 'festiva_ai_preferred_currency';

export class StorageService {
  /**
   * Retrieves all stored events. If none exist, seeds with the Grand Wedding Demo.
   */
  static getAllEvents(): EventRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (!raw) {
        const seeded = [GRAND_WEDDING_DEMO];
        localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(seeded));
        localStorage.setItem(STORAGE_KEY_ACTIVE_ID, GRAND_WEDDING_DEMO.id);
        return seeded;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        const seeded = [GRAND_WEDDING_DEMO];
        localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(seeded));
        return seeded;
      }
      return parsed;
    } catch (e) {
      console.warn('StorageService: failed to read events from localStorage, falling back to demo', e);
      return [GRAND_WEDDING_DEMO];
    }
  }

  /**
   * Retrieves the currently active event ID.
   */
  static getActiveEventId(): string {
    const events = this.getAllEvents();
    const storedId = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    if (storedId && events.some(e => e.id === storedId)) {
      return storedId;
    }
    return events[0]?.id || GRAND_WEDDING_DEMO.id;
  }

  /**
   * Sets the active event ID.
   */
  static setActiveEventId(id: string): void {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  }

  /**
   * Saves or updates a single event.
   */
  static saveEvent(event: EventRecord): void {
    const events = this.getAllEvents();
    const idx = events.findIndex(e => e.id === event.id);
    const updated = {
      ...event,
      updatedAt: new Date().toISOString(),
    };

    if (idx >= 0) {
      events[idx] = updated;
    } else {
      events.unshift(updated);
    }

    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, updated.id);
    } catch (e) {
      console.error('Failed to write event to storage:', e);
    }
  }

  /**
   * Deletes an event by ID.
   */
  static deleteEvent(id: string): boolean {
    let events = this.getAllEvents();
    if (events.length <= 1) {
      // Don't leave zero events; if deleting the last, restore demo
      events = [GRAND_WEDDING_DEMO];
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, GRAND_WEDDING_DEMO.id);
      return true;
    }

    events = events.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));

    const currentActive = this.getActiveEventId();
    if (currentActive === id) {
      this.setActiveEventId(events[0].id);
    }
    return true;
  }

  /**
   * Re-seeds or resets the Grand Wedding demo.
   */
  static resetToDemo(): EventRecord {
    const events = this.getAllEvents();
    const filtered = events.filter(e => e.id !== GRAND_WEDDING_DEMO.id);
    filtered.unshift(GRAND_WEDDING_DEMO);
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(filtered));
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, GRAND_WEDDING_DEMO.id);
    return GRAND_WEDDING_DEMO;
  }

  /**
   * Exports all events as formatted JSON file string.
   */
  static exportBackupJSON(): string {
    const events = this.getAllEvents();
    return JSON.stringify(
      {
        appName: 'Festiva AI',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        events,
      },
      null,
      2
    );
  }

  /**
   * Imports a backup JSON string.
   */
  static importBackupJSON(jsonStr: string): { success: boolean; count?: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      const events: EventRecord[] = Array.isArray(parsed) ? parsed : parsed.events;
      if (!Array.isArray(events) || events.length === 0) {
        return { success: false, error: 'Invalid backup: no event list found.' };
      }
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
      if (events[0]?.id) {
        this.setActiveEventId(events[0].id);
      }
      return { success: true, count: events.length };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to parse JSON file' };
    }
  }
}
