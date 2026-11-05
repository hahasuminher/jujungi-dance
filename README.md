# 주둥이 댄스

아무 말이나 입력하면 웃긴 목소리로 읽어주고, 무표정한 아저씨가 춤을 추는 웹 놀이입니다.

- 한글, 영어, 숫자 입력
- 문장부호에 따라 달라지는 목소리(`!!!`, `???`, `~~~`, `...`)
- 목소리 직접 만들기

- 숨은 단어와 필살 춤
- 숨은 단어에서만 나오는 둠칫 비트와 4초 필살 춤
- 춤 공유 링크

## 실행

`site` 폴더를 그대로 정적 호스팅에 올리면 됩니다. 빌드 과정은 없습니다.

```
npx serve site
```

## 구조

- `site/`: 배포되는 사이트
- `tools/`: 캐릭터 그림과 음성 엔진 데이터를 만드는 스크립트

## 라이선스

GPL-3.0. 음성 합성에 [eSpeak NG](https://github.com/espeak-ng/espeak-ng)(GPL-3.0)를 사용합니다. 줄인 엔진은 `site/vendor`에 있고, `tools/build_engine.py`로 [`@echogarden/espeak-ng-emscripten`](https://github.com/echogarden-project/espeak-ng-emscripten) 패키지에서 만듭니다.
