# Kakao 로그인 네이티브 설정 체크리스트

## 1. Kakao Developers 등록
1. https://developers.kakao.com 에서 애플리케이션 생성
2. 플랫폼 → iOS / Android 등록
   - iOS Bundle ID: `com.catech.app`
   - Android 패키지: `com.catech.app`
   - Android 키해시: `keytool -exportcert -alias <alias> -keystore <keystore> | openssl sha1 -binary | openssl base64`
3. 카카오 로그인 → 활성화 ON, Redirect URI 등록 (네이티브는 `kakao{APP_KEY}://oauth`)
4. 동의항목: 닉네임(필수), 프로필사진(선택), 이메일(선택)
5. `네이티브 앱 키` 복사 → `.env.local` 의 `EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY`

## 2. iOS Info.plist (prebuild 자동 적용)
플러그인이 자동 생성하지만, 수동 확인 항목:
- `LSApplicationQueriesSchemes`: `kakaokompassauth`, `kakaolink`
- `CFBundleURLTypes`: `kakao{APP_KEY}` scheme 포함

## 3. Android AndroidManifest (prebuild 자동 적용)
- `<data android:scheme="kakao{APP_KEY}" android:host="oauth" />` intent-filter 포함 확인

## 4. prebuild 실행
`npm --prefix mobile run prebuild` (또는 `npx expo prebuild --clean`) — 이후 `ios/`, `android/` 폴더가 생성됨.

## 5. EAS Dev Client 빌드
Expo Go 에서는 카카오 네이티브 SDK 동작 불가. 개발 빌드 필요:
- `npx eas login`
- `npx eas build --profile development --platform ios`
- 완료 후 TestFlight/ad-hoc 설치 → `npx expo start --dev-client`

## 6. 검증
앱 실행 → 카카오 버튼 탭 → 카카오톡 앱 전환 또는 웹뷰 로그인 → 동의 → 앱 복귀 → 홈 화면 진입.
