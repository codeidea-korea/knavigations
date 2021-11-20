/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState, useRef } from 'react';
import type { Node } from 'react';
// import SplashScreen from 'react-native-splash-screen';
import { WebView } from 'react-native-webview';
// import { sourceUrl, userAgent } from '../global/conf';
// import CustomSplashView from './src/views/CustomSplashView';
import SplashImage from './assets/image/splash_text.png';
import SplashImageBg from './assets/image/splash_bg2.png';

import appleAuth from '@invertase/react-native-apple-authentication';
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import Tts from 'react-native-tts';

const sourceUrl = 'http://knavigation.codeidea.io';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Image,
  ImageBackground,
  Linking, 
  BackHandler, Alert, ToastAndroid,
  Platform,
  PermissionsAndroid,
  Dimensions,

} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

  const signIn = async () => {
    try {
      GoogleSignin.configure({
        webClientId: GOOGLE_WEBID, // client ID of type WEB for your server (needed to verify user ID and offline access)
        offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
      });

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (userInfo.user.email === null) {
        setMessage(
          "구글 계정에 이메일 정보가 없습니다."
        );
      }
      if (userInfo.user.email !== null) {
        setLogin(true);
        setEmail(userInfo.user.email);
        GoogleAccount();
        setMessage("Google sign in successful.");
      }
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        setMessage("Google signin was cancelled."); // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        setMessage("Login is in progress."); // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setMessage("Google services not available or outdated."); // play services not available or outdated
      } else {
        setMessage("An error occured. check your network and try again."); // some other error happened
      }
    }
  };

  const signOut = async () => {
    try {
      GoogleSignin.configure({
        webClientId: GOOGLE_WEBID, // client ID of type WEB for your server (needed to verify user ID and offline access)
        offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
      });
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      setLogin(false);
    } catch (error) {
      console.error(error);
    }
  };

const onAppleLogin = async () => {
  try {
    const responseObject = await appleAuth.performRequest({
      requestedOperation: AppleAuthRequestOperation.LOGIN,
      requestedScopes: [AppleAuthRequestScope.EMAIL, AppleAuthRequestScope.FULL_NAME],
    });
    console.log('responseObject:::', responseObject);
    const credentialState = await appleAuth.getCredentialStateForUser(
      responseObject.user,
    );
    if (credentialState === AppleAuthCredentialState.AUTHORIZED) {
      console.log('user is authenticated');

      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'REQ_SIGN_IN_APPLE'
            , is_success: true, response: responseObject })
      );
    }
  } catch (error) {
    console.log(error);
    let cause = '';
    if (error.code === AppleAuthError.CANCELED) {
      console.log('canceled');
      cause = '로그인 취소됨';
    } else {
      console.log('error');
      cause = '로그인 실패';
    }

    window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: 'REQ_SIGN_IN_APPLE'
          , is_success: false, reason: cause })
    );
  }
};

const guidelineBaseWidth = 320;
const guidelineBaseHeight = 692;
const guideScale = Math.sqrt(guidelineBaseWidth * guidelineBaseHeight);
const scale = Math.sqrt(Dimensions.get('window').width * Dimensions.get('window').height) / guideScale;
const horiPer = Dimensions.get('window').width / guidelineBaseWidth;
const vertiPer = Dimensions.get('window').height / guidelineBaseHeight;

const verticalScale = size => horiPer * size;
const horizontalScale = size => vertiPer * size;
const moderateScale = size => scale * size;

const SplashView = ({children}): Node => {

  return (
    <View style={styles.sectionContainer}>
        <Image 
          style={styles.bgImage}
          fadeDuration={700}
          resizeMode='cover'
          source={SplashImageBg} />

        <Image 
              style={styles.txtImage}
              fadeDuration={700}
              resizeMode='contain'
              source={SplashImage} />
    </View>
  );
};

// 사운드 재생
const speekMessage = (ment) => {
  Tts.stop();
  Tts.speak(ment);

  window.ReactNativeWebView.postMessage(
    JSON.stringify({ type: "REQ_SPEEK", response: ment, isSuccess: true })
  );
};
const handleOnMessage = ({ nativeEvent: { data } }) => {
  
  console.log(data);

  if(data.type == 'REQ_SPEEK'){
    if(!data.text || data.text == '') {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: data.type, response: data.text, is_success: false, reason: '멘트 내용이 있어야합니다.' })
      );
      return false;
    }
    speekMessage(data.text);
  } else if(data.type == 'REQ_OS_TYPE'){
    var osName = 'WEB';
    osName = (Platform.os == 'ios' || Platform.os == 'android' ? Platform.os : osName);

    window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: 'REQ_OS_TYPE', is_success: true, response: {
        os_type: osName
      } })
    );
  } else if(data.type == 'REQ_SIGN_IN_APPLE'){
    onAppleLogin();
  } else if(data.type == 'REQ_SIGN_IN_GOOGLE'){
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: data.type, is_success: false, reason: '준비중입니다.' })
    );
  }
};
// 구글 로그인

/*
TTS 기준
로그인페이지 http://knavigation.codeidea.io/login
- 좋아하는 스타의 코스를 한눈에! 직접 방문해 보고 팬들과 함께 공유해 보세요
코스만들기 http://knavigation.codeidea.io/course/make
- 코스를 직접 만들어보세요
스타코스 http://knavigation.codeidea.io/course/star
- 좋아하는 스타의 코스를 확인해보세요
나의코스 http://knavigation.codeidea.io/course/pick
- 직접 코스를 만들어보세요
*/

const App: () => Node = () => {
  const ref = useRef();
  const [isSplash, setIsSplash] = useState(true);
  const [isBackPressed, setIsBackPressed] = useState(false);
  const [seconds, setSeconds] = useState(3);
  let timeout;



  useEffect(() => {
    const countdown = setInterval(() => {
      if (parseInt(seconds) > 0) {
        setSeconds(parseInt(seconds) - 1);
      }
      if (parseInt(seconds) === 0) {
        clearInterval(countdown);
        setIsSplash(false);
      }
    }, 1000);
    return () => clearInterval(countdown);
  }, [seconds]);

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const ttsConfiguration = () => {
    Tts.setDefaultLanguage('ko-KR');
    // Tts.setDefaultVoice('com.apple.ttsbundle.Yuna-compact');
    Tts.addEventListener('tts-start', event => console.log('start', event));
    Tts.addEventListener('tts-finish', event => console.log('finish', event));
    Tts.addEventListener('tts-cancel', event => console.log('cancel', event));
  };
  ttsConfiguration();

  if(isSplash)
    return (
      <SplashView></SplashView>
    );

const onShouldStartLoadWithRequest = (event) => {
  if (
      event.url.startsWith('http://') ||
      event.url.startsWith('https://') ||
      event.url.startsWith('about:blank')
    ) {
      return true;
    }
    if (Platform.OS === 'android') {
      const SendIntentAndroid = require('react-native-send-intent');
      SendIntentAndroid.openAppWithUri(event.url)
        .then(isOpened => {
          if (!isOpened) {
            alert('앱 실행에 실패했습니다');
          }
        })
        .catch(err => {
          console.log(err);
        });
        
        return false;
    } else {
      Linking.openURL(event.url).catch(err => {
        alert(
          '앱 실행에 실패했습니다. 설치가 되어있지 않은 경우 설치하기 버튼을 눌러주세요.',
        );
      });
      return false;
    }
};

const handleWebViewNavigationStateChange = (newNavState, props) => {
  const { url } = newNavState;
  if (!url) return;
  if (url.includes('nmap://') || url.includes('intent://')) return;
  if (!url.includes('http://') && !url.includes('https://')) return;
  
};
const INJECTED_CODE = `
(function() {
  function wrap(fn) {
    return function wrapper() {
      var res = fn.apply(this, arguments);
      window.ReactNativeWebView.postMessage('navigationStateChange');
      return res;
    }
  }

  history.pushState = wrap(history.pushState);
  history.replaceState = wrap(history.replaceState);
  window.addEventListener('popstate', function() {
    window.ReactNativeWebView.postMessage('navigationStateChange');
  });
})();

true;
`;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView
        ref={ref}
        originWhitelist={["*"]}
        source={{ uri: sourceUrl }}
        style={{ marginTop: 0 }}
        userAgent="Mozilla/5.0 (Linux; Android 11; SM-A102U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Mobile Safari/537.36"
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        useWebKit={true}
        androidHardwareAccelerationDisabled
        onShouldStartLoadWithRequest={(event) => {
          return onShouldStartLoadWithRequest(event);
        }}
        onNavigationStateChange={handleWebViewNavigationStateChange}
        onMessage={handleOnMessage}
        //          onLoadStart={() => ref.current.injectJavaScript(INJECTED_CODE)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 0,
    paddingHorizontal: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  txtImage: {
    margin: 0,
    padding: 0,
    transform: [{ scale: 0.7 }],
    paddingHorizontal: 0,
    position:'absolute',
  },
  bgImage: {
    margin: 0,
    marginTop: 0,
    padding: 0,
    paddingHorizontal: 0,
    width: Dimensions.get('window').width, height: Dimensions.get('window').height,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default App;
