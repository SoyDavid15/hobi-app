import { useEffect, useRef, useState, useCallback } from "react";
import { Alert, NativeModules } from "react-native";

const IS_ADMOB_AVAILABLE = !!NativeModules.RNGoogleMobileAdsModule;

export interface UseRewardedAdResult {
  isLoaded: boolean;
  isShowing: boolean;
  showRewardedAd: () => Promise<boolean>;
  preloadRewardedAd: () => void;
}

export function useRewardedAd(): UseRewardedAdResult {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const rewardedRef = useRef<any>(null);
  const earnPromiseRef = useRef<{
    resolve: (earned: boolean) => void;
  } | null>(null);
  const preloadRef = useRef<() => void>(() => {});

  const loadRewarded = useCallback(() => {
    if (!IS_ADMOB_AVAILABLE) return;

    const {
      RewardedAd,
      RewardedAdEventType,
      TestIds,
      AdEventType,
    } = require("react-native-google-mobile-ads");

    if (rewardedRef.current) {
      rewardedRef.current.removeAllListeners();
    }

    const rewarded = RewardedAd.createForAdRequest(TestIds.REWARDED);
    rewardedRef.current = rewarded;

    rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setIsLoaded(true);
    });

    rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        if (earnPromiseRef.current) {
          earnPromiseRef.current.resolve(true);
          earnPromiseRef.current = null;
        }
      }
    );

    rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      setIsShowing(false);
      if (earnPromiseRef.current) {
        earnPromiseRef.current.resolve(false);
        earnPromiseRef.current = null;
      }
      setIsLoaded(false);
      setTimeout(() => preloadRef.current(), 1000);
    });

    rewarded.addAdEventListener(AdEventType.OPENED, () => {
      setIsShowing(true);
    });

    rewarded.addAdEventListener(AdEventType.ERROR, () => {
      setIsLoaded(false);
      setTimeout(() => preloadRef.current(), 5000);
    });

    rewarded.load();
  }, []);

  const preloadRewardedAd = useCallback(() => {
    loadRewarded();
  }, [loadRewarded]);

  useEffect(() => {
    preloadRef.current = loadRewarded;

    if (IS_ADMOB_AVAILABLE) {
      loadRewarded();
    } else {
      const timer = setTimeout(() => setIsLoaded(true), 500);
      return () => clearTimeout(timer);
    }
  }, [loadRewarded]);

  const showRewardedAd = useCallback((): Promise<boolean> => {
    if (!IS_ADMOB_AVAILABLE) {
      return new Promise<boolean>((resolve) => {
        setIsShowing(true);
        Alert.alert(
          "Anuncio de prueba (Expo Go)",
          "En produccion aparecera un anuncio recompensado real de AdMob.\n\nQuieres simular que viste el anuncio completo?",
          [
            {
              text: "Cerrar (no ver)",
              onPress: () => {
                setIsShowing(false);
                resolve(false);
              },
              style: "cancel",
            },
            {
              text: "Ver anuncio completo",
              onPress: () => {
                setIsShowing(false);
                resolve(true);
              },
            },
          ],
          { cancelable: false }
        );
      });
    }

    return new Promise<boolean>((resolve) => {
      if (!rewardedRef.current || !isLoaded) {
        resolve(false);
        return;
      }

      earnPromiseRef.current = { resolve };
      rewardedRef.current.show();
    });
  }, [isLoaded]);

  return {
    isLoaded,
    isShowing,
    showRewardedAd,
    preloadRewardedAd,
  };
}