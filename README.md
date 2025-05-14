# Firebase를 이용한 Todo-List 애플리케이션

이 프로젝트는 React, Next.js와 Firebase를 사용하여 만든 할 일 목록(Todo-List) 애플리케이션입니다.

## 배포 URL
[Todo App - Vercel](https://todo-app-eight-sage-83.vercel.app/)

## 기능 설명

- Firebase Firestore를 이용한 데이터 저장 및 관리
- 할 일 목록 조회: 모든 할 일을 제목, 내용, 마감 기한과 함께 확인할 수 있습니다.
- 할 일 추가: 새로운 할 일을 제목, 세부사항, 마감 기한과 함께 추가할 수 있습니다.
- 할 일 삭제: 완료한 할 일이나 필요 없는 할 일을 삭제할 수 있습니다.
- 정렬 기능: 등록순, 오래된순, 마감일순으로 정렬 가능

## Firebase 데이터 구조

- 컬렉션: `todos`
- 문서 필드:
  - `title`: 할 일 제목 (문자열)
  - `description`: 할 일 세부 내용 (문자열)
  - `deadline`: 마감일 (문자열, YYYY-MM-DD 형식)
  - `createdAt`: 생성 시간 (타임스탬프)
  - `completed`: 완료 여부 (불리언)
