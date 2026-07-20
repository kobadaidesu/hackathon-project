import {Navigate, Outlet} from "react-router-dom";

export function ProtectedRoute() {
    //本来はここで、AuthContextからcurrentUserを取得する
    //今は仮で「ログイン済み」ということにする
    const isAuthenticated = true;//

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return <Outlet />;
}