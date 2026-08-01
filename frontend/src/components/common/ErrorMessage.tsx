type ErrorMessageProps = {
    message: string;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
    // 空なら何も描かない。.error-message には背景色(薄ピンク)とパディングが
    // 付いているので、文字が無くても帯として見えてしまう。
    // 呼び出し側に error && を書かせる形にすると、囲い忘れた画面で
    // 同じ帯がまた出るので、ここで塞いでおく
    if (message.trim().length === 0) return null;

    return (
        <p className="error-message">{message}</p>
    );
}
