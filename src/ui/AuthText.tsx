
function AuthText({title,body}: {title?: string; body?: string}) {
    return (
        <>
            <h1 className="mb-3 text-center text-4xl font-semibold text-slate-900 dark:text-white">{title}</h1>
            <p className="mb-8 text-center text-lg text-slate-600 dark:text-slate-300">{body}</p>
        </>
    );
}

export default AuthText;
