import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { LoginPage } from "./pages/LoginPage"
import { SignupPage } from "./pages/SignupPage"
import { TimelinePage } from "./pages/TimelinePage"
import { ProfileSetupPage } from "./pages/ProfileSetupPage"
import { MyProfilePage } from "./pages/MyProfilePage"
import { UserProfilePage } from "./pages/UserProfilePage"
import { CreatePostPage } from "./pages/CreatePostPage"
import { PostCompletePage } from "./pages/PostCompletePage"
import { RecruitmentListPage } from "./pages/RecruitmentListPage"
import { CreateRecruitmentPage } from "./pages/CreateRecruitmentPage"
import { RecruitmentDetailPage } from "./pages/RecruitmentDetailPage"
import { MessageListPage } from "./pages/MessageListPage"
import { MessageThreadPage } from "./pages/MessageThreadPage"
import { NotFoundPage } from "./pages/NotFoundPage"
import { ProtectedRoute } from "./components/common/ProtectedRoute"
import { Header } from "./components/common/Header"
import { TabBar } from "./components/common/TabBar"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* Headerは全画面共通。未ログイン時はナビを出さない分岐がHeader側にある */}
        <Header />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<TimelinePage />} />
            <Route path="/profile/setup" element={<ProfileSetupPage />} />
            <Route path="/profile" element={<MyProfilePage />} />
            <Route path="/users/:userId" element={<UserProfilePage />} />
            <Route path="/posts/new" element={<CreatePostPage />} />
            <Route path="/posts/complete" element={<PostCompletePage />} />
            <Route path="/recruitments" element={<RecruitmentListPage />} />
            <Route path="/recruitments/new" element={<CreateRecruitmentPage />} />
            <Route path="/recruitments/:recruitmentId" element={<RecruitmentDetailPage />} />
            <Route path="/messages" element={<MessageListPage />} />
            <Route path="/messages/:userId" element={<MessageThreadPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
        {/* 下部タブバー。未ログイン時はTabBar側で描画しない分岐がある */}
        <TabBar />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App