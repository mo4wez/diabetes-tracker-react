import { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setErrorMsg(
        err.message === "Invalid login credentials"
          ? "ایمیل یا رمز عبور اشتباه است."
          : err.message,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Wrapper>
      <Card>
        <Header>
          <Title>دفترچه ثبت قند خون و انسولین</Title>
          <Subtitle>برای دسترسی به اطلاعات شخصی وارد شوید</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FieldGroup>
            <Label htmlFor="email">ایمیل</Label>
            <Input
              id="email"
              type="email"
              dir="ltr"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="password">رمز عبور</Label>
            <Input
              id="password"
              type="password"
              dir="ltr"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FieldGroup>

          {errorMsg && <ErrorBox role="alert">{errorMsg}</ErrorBox>}

          <SubmitButton type="submit" disabled={submitting}>
            {submitting ? "در حال ورود..." : "ورود به حساب"}
          </SubmitButton>
        </Form>
      </Card>
    </Wrapper>
  );
}

const Wrapper = styled.main`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.bgApp};
`;

const Card = styled.section`
  width: 100%;
  max-width: 400px;
  background-color: ${({ theme }) => theme.colors.bgSurface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ theme }) => theme.colors.bgSubtle};
  text-align: left;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.bgSurface};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight};
  }
`;

const ErrorBox = styled.div`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background-color: ${({ theme }) => theme.colors.glucose.low.bg};
  border: 1px solid ${({ theme }) => theme.colors.glucose.low.border};
  color: ${({ theme }) => theme.colors.glucose.low.text};
  font-size: 0.85rem;
`;

const SubmitButton = styled.button`
  margin-top: ${({ theme }) => theme.spacing.xs};
  padding: 11px;
  border-radius: ${({ theme }) => theme.radii.md};
  background-color: ${({ theme }) => theme.colors.primary};
  color: #ffffff;
  font-weight: 600;
  transition: background-color 0.15s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;
