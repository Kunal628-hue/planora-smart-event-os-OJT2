import { renderHook, act, waitFor } from '@testing-library/react';
import { useCopyToClipboard } from '../useCopyToClipboard';

// Mock clipboard
Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn(),
    },
});

describe('useCopyToClipboard hook', () => {
    beforeEach(() => {
        // Clear mocks and DOM before each test
        jest.clearAllMocks();
        document.body.innerHTML = '';
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should copy text successfully and show success toast', async () => {
        navigator.clipboard.writeText.mockResolvedValueOnce();

        const { result } = renderHook(() => useCopyToClipboard());

        let success;
        act(() => {
            result.current.copyToClipboard('test-string').then(res => {
                success = res;
            });
        });

        // Wait for promises to resolve
        await waitFor(() => {
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-string');
        });

        // Verify toast was created
        const toast = document.querySelector('[data-testid="clipboard-toast-success"]');
        expect(toast).not.toBeNull();
        expect(toast.textContent).toBe('Copied to clipboard!');

        // Check if `isCopied` state is true
        expect(result.current.isCopied).toBe(true);
    });

    it('should handle failure and show error toast', async () => {
        navigator.clipboard.writeText.mockRejectedValueOnce(new Error('Copy failed'));

        const { result } = renderHook(() => useCopyToClipboard());

        act(() => {
            result.current.copyToClipboard('test-string-fail');
        });

        await waitFor(() => {
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-string-fail');
        });

        // Verify error toast was created
        const toast = document.querySelector('[data-testid="clipboard-toast-error"]');
        expect(toast).not.toBeNull();
        expect(toast.textContent).toBe('Failed to copy to clipboard');

        // Check if `isCopied` state is false
        expect(result.current.isCopied).toBe(false);
    });
});
