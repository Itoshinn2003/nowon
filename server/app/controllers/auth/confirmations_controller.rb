module Auth
  class ConfirmationsController < DeviseTokenAuth::ConfirmationsController
    def show
      resource = resource_class.confirm_by_token(resource_params[:confirmation_token])

      if resource.errors.empty?
        render html: confirmation_success_html.html_safe
      else
        render html: confirmation_failure_html.html_safe,
               status: :unprocessable_entity
      end
    end

    private

    def confirmation_success_html
      <<~HTML
        <!doctype html>
        <html lang="ja">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>メール認証完了</title>
            <style>
              body {
                margin: 0;
                min-height: 100vh;
                display: grid;
                place-items: center;
                background: #ffffff;
                color: #111827;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              }
              main {
                width: min(100% - 48px, 420px);
                text-align: center;
              }
              h1 {
                margin: 0 0 12px;
                font-size: 28px;
                line-height: 1.35;
              }
              p {
                margin: 0;
                color: #4b5563;
                font-size: 16px;
                line-height: 1.7;
              }
            </style>
          </head>
          <body>
            <main>
              <h1>メール認証が完了しました</h1>
              <p>アプリに戻って、登録したメールアドレスとパスワードでログインしてください。</p>
            </main>
          </body>
        </html>
      HTML
    end

    def confirmation_failure_html
      <<~HTML
        <!doctype html>
        <html lang="ja">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>メール認証エラー</title>
            <style>
              body {
                margin: 0;
                min-height: 100vh;
                display: grid;
                place-items: center;
                background: #ffffff;
                color: #111827;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              }
              main {
                width: min(100% - 48px, 420px);
                text-align: center;
              }
              h1 {
                margin: 0 0 12px;
                font-size: 28px;
                line-height: 1.35;
              }
              p {
                margin: 0;
                color: #4b5563;
                font-size: 16px;
                line-height: 1.7;
              }
            </style>
          </head>
          <body>
            <main>
              <h1>メール認証に失敗しました</h1>
              <p>認証リンクの有効期限が切れているか、すでに使用済みの可能性があります。</p>
            </main>
          </body>
        </html>
      HTML
    end
  end
end
