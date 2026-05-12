import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ATLAS_BOOT_SEQUENCE, streamBootSequence } from '../meshBootSequence';

// T030 — ATLAS_BOOT_SEQUENCE content assertions
describe('ATLAS_BOOT_SEQUENCE', () => {
  it('has at least 30 entries', () => {
    expect(ATLAS_BOOT_SEQUENCE.length).toBeGreaterThanOrEqual(30);
  });

  it('includes a line containing "DID:mesh:"', () => {
    const found = ATLAS_BOOT_SEQUENCE.some(line => line.text.includes('DID:mesh:'));
    expect(found).toBe(true);
  });

  it('includes a line containing "BLE"', () => {
    const found = ATLAS_BOOT_SEQUENCE.some(line => line.text.includes('BLE'));
    expect(found).toBe(true);
  });

  it('includes a line containing "LoRa"', () => {
    const found = ATLAS_BOOT_SEQUENCE.some(line => line.text.includes('LoRa'));
    expect(found).toBe(true);
  });

  it('includes a line containing "Satellite"', () => {
    const found = ATLAS_BOOT_SEQUENCE.some(line => line.text.includes('Satellite'));
    expect(found).toBe(true);
  });

  it('includes a line containing "Verifiable Credential"', () => {
    const found = ATLAS_BOOT_SEQUENCE.some(line => line.text.includes('Verifiable Credential'));
    expect(found).toBe(true);
  });

  it('includes a line containing "FULLY OPERATIONAL"', () => {
    const found = ATLAS_BOOT_SEQUENCE.some(line => line.text.includes('FULLY OPERATIONAL'));
    expect(found).toBe(true);
  });
});

// T031 — streamBootSequence returns a cancel function
describe('streamBootSequence — cancel function', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a cancel function', () => {
    const appendLine = vi.fn();
    const cancel = streamBootSequence(appendLine);
    expect(typeof cancel).toBe('function');
    cancel();
  });

  it('appends lines over time when not cancelled', () => {
    const appendLine = vi.fn();
    streamBootSequence(appendLine);

    // No lines at t=0
    expect(appendLine).not.toHaveBeenCalled();

    // Advance past the cumulative delay for the first several lines
    vi.advanceTimersByTime(2000);
    expect(appendLine.mock.calls.length).toBeGreaterThan(0);
  });

  it('stops appending lines after cancel() is called', () => {
    const appendLine = vi.fn();
    const cancel = streamBootSequence(appendLine);

    // Advance enough to trigger a few lines
    vi.advanceTimersByTime(500);
    const countBeforeCancel = appendLine.mock.calls.length;

    // Cancel the sequence
    cancel();

    // Advance more time — no additional lines should be appended
    vi.advanceTimersByTime(10000);
    expect(appendLine.mock.calls.length).toBe(countBeforeCancel);
  });
});

// T032 — second call cancels the first sequence
describe('streamBootSequence — second call cancels first', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('cancels the first sequence before starting the second', () => {
    const appendLine1 = vi.fn();
    const appendLine2 = vi.fn();

    // Start first sequence
    streamBootSequence(appendLine1);

    // Advance a little bit — first sequence partially runs
    vi.advanceTimersByTime(300);
    const firstPartialCount = appendLine1.mock.calls.length;

    // Start second sequence — should cancel the first
    streamBootSequence(appendLine2);

    // Advance a lot more
    vi.advanceTimersByTime(10000);

    // First sequence should not have received more lines after the second started
    expect(appendLine1.mock.calls.length).toBe(firstPartialCount);

    // Second sequence should have started from the beginning and received lines
    expect(appendLine2.mock.calls.length).toBeGreaterThan(0);
  });

  it('second sequence starts from the beginning (first line appended)', () => {
    const appendLine1 = vi.fn();
    const appendLine2 = vi.fn();

    streamBootSequence(appendLine1);

    // Advance past all lines
    vi.advanceTimersByTime(20000);

    // Start second sequence
    streamBootSequence(appendLine2);

    // Advance enough for first line (delayMs: 0 for first entry)
    vi.advanceTimersByTime(100);

    // Second sequence should have received the first line
    expect(appendLine2.mock.calls.length).toBeGreaterThan(0);
    // The first call of the second sequence should be the first boot line
    expect(appendLine2.mock.calls[0][0]).toBe(ATLAS_BOOT_SEQUENCE[0].text);
  });
});
