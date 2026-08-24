# 승지정밀산업롤 럭셔리 3D 랜딩페이지

승지정밀산업롤의 초정밀 산업용 롤 제작·표면처리 기술을 소개하는 정적 랜딩페이지입니다.

## 로컬 미리보기

프로젝트 폴더에서 다음 명령을 실행합니다.

```powershell
python -m http.server 5500 --bind 127.0.0.1
```

브라우저에서 <http://127.0.0.1:5500/>을 엽니다.

## 구성

- `index.html` — 페이지 구조와 콘텐츠
- `style.css` — 반응형 스타일과 테마
- `main.js` — Spline 처리, 단계 탐색, FAQ, 견적 모달 인터랙션
- `assets/` — 페이지에 사용되는 산업 이미지

Spline Viewer, Tailwind CSS, Lucide, Lenis, VanillaTilt, canvas-confetti는 CDN을 통해 로드됩니다.
