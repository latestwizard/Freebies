import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SubmitDealModal } from '../SubmitDealModal';

describe('SubmitDealModal Component', () => {
  it('renders modal form when isOpen is true', () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();
    const addToast = vi.fn();

    render(
      <SubmitDealModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        addToast={addToast}
      />
    );

    expect(screen.getByText('Submit a Referral Freebie')).toBeInTheDocument();
  });

  it('displays URL validation error when submitting dangerous javascript: URL', () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();
    const addToast = vi.fn();

    render(
      <SubmitDealModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        addToast={addToast}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/e\.g\. \$100 Free VPS Hosting Credit/i), {
      target: { value: 'Malicious Offer' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Linode \/ DigitalOcean/i), {
      target: { value: 'BadActor' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. \$100 Free Credit \/ 100% Free/i), {
      target: { value: '$100 Free' },
    });
    fireEvent.change(screen.getByPlaceholderText(/https:\/\/example\.com\/register\?ref=yourcode/i), {
      target: { value: 'javascript:alert(1)' },
    });

    const submitBtn = screen.getByRole('button', { name: /Submit for Review/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Please enter a valid URL starting with http:\/\/ or https:\/\//i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits valid deal with pending status', () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();
    const addToast = vi.fn();

    render(
      <SubmitDealModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        addToast={addToast}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(/e\.g\. \$100 Free VPS Hosting Credit/i), {
      target: { value: 'Valid Community Offer' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. Linode \/ DigitalOcean/i), {
      target: { value: 'GoodProvider' },
    });
    fireEvent.change(screen.getByPlaceholderText(/e\.g\. \$100 Free Credit \/ 100% Free/i), {
      target: { value: '$50 Credit' },
    });
    fireEvent.change(screen.getByPlaceholderText(/https:\/\/example\.com\/register\?ref=yourcode/i), {
      target: { value: 'https://valid-referral.com/ref' },
    });

    const submitBtn = screen.getByRole('button', { name: /Submit for Review/i });
    fireEvent.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Valid Community Offer',
        provider: 'GoodProvider',
        status: 'pending',
        referralUrl: 'https://valid-referral.com/ref',
      })
    );
    expect(addToast).toHaveBeenCalledWith('Offer submitted for community review!', 'success');
  });
});
