import React from 'react';
import { useFeatureFlag } from '@/hooks/usePostHog';

/**
 * Component for conditional rendering based on feature flags
 */
const FeatureFlag = ({
    flag,
    children,
    fallback = null,
    loading = null,
    onEnabled = null,
    onDisabled = null
}) => {
    const { isEnabled, isLoading, payload } = useFeatureFlag(flag);

    // Handle loading state
    if (isLoading) {
        return loading;
    }

    // Handle enabled state
    if (isEnabled) {
        if (onEnabled) {
            onEnabled(payload);
        }
        return typeof children === 'function' ? children(payload) : children;
    }

    // Handle disabled state
    if (onDisabled) {
        onDisabled();
    }
    return fallback;
};

/**
 * Component for A/B testing with automatic variant tracking
 */
export const ABTest = ({
    testKey,
    variants = {},
    fallback = null,
    trackViews = true
}) => {
    const { isEnabled, variant, payload, trackVariantView } = useABTest(testKey);

    React.useEffect(() => {
        if (isEnabled && trackViews) {
            trackVariantView(variant);
        }
    }, [isEnabled, variant, trackViews, trackVariantView]);

    if (!isEnabled) {
        return fallback;
    }

    const VariantComponent = variants[variant] || variants.control || fallback;

    if (typeof VariantComponent === 'function') {
        return <VariantComponent payload={payload} variant={variant} />;
    }

    return VariantComponent;
};

/**
 * Higher-order component for feature flag wrapping
 */
export const withFeatureFlag = (flag, fallbackComponent = null) => {
    return (WrappedComponent) => {
        const FeatureFlaggedComponent = (props) => (
            <FeatureFlag flag={flag} fallback={fallbackComponent}>
                <WrappedComponent {...props} />
            </FeatureFlag>
        );

        FeatureFlaggedComponent.displayName = `withFeatureFlag(${WrappedComponent.displayName || WrappedComponent.name})`;

        return FeatureFlaggedComponent;
    };
};

/**
 * Hook for A/B testing (re-exported from usePostHog for convenience)
 */
export { useABTest } from '@/hooks/usePostHog';

export default FeatureFlag;