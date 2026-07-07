import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StellarProvider, useStellar } from '../context/StellarContext';

// ─── Test 1: StellarProvider renders children ────────────────────────────────
describe('StellarProvider', () => {
  it('renders children without crashing', () => {
    render(
      <StellarProvider>
        <div data-testid="child">hello</div>
      </StellarProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});

// ─── Test 2: Wallet state defaults ──────────────────────────────────────────
function WalletStatus() {
  const { wallet } = useStellar();
  return (
    <div>
      <span data-testid="connected">{wallet.connected.toString()}</span>
      <span data-testid="balance">{wallet.balance}</span>
    </div>
  );
}

describe('Wallet state', () => {
  it('starts disconnected with zero balance', () => {
    render(
      <StellarProvider>
        <WalletStatus />
      </StellarProvider>
    );
    expect(screen.getByTestId('connected').textContent).toBe('false');
    expect(screen.getByTestId('balance').textContent).toBe('0');
  });

  it('connects sandbox wallet and sets balance to 10000', async () => {
    function TestConnect() {
      const { wallet, connectSandbox } = useStellar();
      return (
        <div>
          <button onClick={connectSandbox}>Connect</button>
          <span data-testid="balance">{wallet.balance}</span>
          <span data-testid="sandbox">{wallet.isSandbox.toString()}</span>
        </div>
      );
    }
    render(<StellarProvider><TestConnect /></StellarProvider>);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByTestId('balance').textContent).toBe('10000.00');
      expect(screen.getByTestId('sandbox').textContent).toBe('true');
    });
  });
});

// ─── Test 3: Events are seeded ───────────────────────────────────────────────
function EventList() {
  const { events } = useStellar();
  return <span data-testid="count">{events.length}</span>;
}

describe('Event seeding', () => {
  it('loads seed events on startup', () => {
    render(<StellarProvider><EventList /></StellarProvider>);
    const count = parseInt(screen.getByTestId('count').textContent || '0');
    expect(count).toBeGreaterThanOrEqual(6);
  });
});

// ─── Test 4: Toast notifications ─────────────────────────────────────────────
function ToastTrigger() {
  const { addToast } = useStellar();
  return <button onClick={() => addToast('Test toast', 'success')}>Toast</button>;
}

describe('Toast notifications', () => {
  it('adds and renders a toast message', async () => {
    render(<StellarProvider><ToastTrigger /></StellarProvider>);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByText('Test toast')).toBeInTheDocument();
    });
  });
});

// ─── Test 5: Buy ticket requires wallet ──────────────────────────────────────
function BuyTest() {
  const { buyTicket, toasts } = useStellar();
  return (
    <div>
      <button onClick={() => buyTicket(1)}>Buy</button>
      {toasts.map(t => <span key={t.id} data-testid={`toast-${t.type}`}>{t.message}</span>)}
    </div>
  );
}

describe('Buy ticket', () => {
  it('shows error toast when wallet not connected', async () => {
    render(<StellarProvider><BuyTest /></StellarProvider>);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => {
      expect(screen.getByTestId('toast-error')).toBeInTheDocument();
    });
  });
});
