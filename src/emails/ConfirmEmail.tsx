import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";

interface ConfirmEmailProps {
    name?: string | null;
    confirmationUrl: string;
}

export default function ConfirmEmail({ name, confirmationUrl }: ConfirmEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Confirmez votre adresse email pour finaliser votre compte.</Preview>
            <Body style={styles.body}>
                <Container style={styles.container}>
                    <Section>
                        <Heading style={styles.heading}>Bienvenue sur Forum !</Heading>
                        <Text style={styles.paragraph}>
                            Bonjour {name ? `${name}` : "et bienvenue"},
                        </Text>
                        <Text style={styles.paragraph}>
                            Merci d&apos;avoir créé un compte. Pour finaliser votre inscription, nous
                            devons confirmer que cette adresse email vous appartient.
                        </Text>
                        <Section style={styles.buttonContainer}>
                            <Button href={confirmationUrl} style={styles.button}>
                                Confirmer mon email
                            </Button>
                        </Section>
                        <Text style={styles.paragraph}>
                            Ce lien expire dans 24 heures. Si vous n&apos;êtes pas à l&apos;origine de cette demande,
                            vous pouvez ignorer cet email et votre compte ne sera pas activé.
                        </Text>
                        <Hr style={styles.hr} />
                        <Text style={styles.footer}>
                            Forum · Propulsé par Next.js · Merci de faire partie de la communauté.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

const styles = {
    body: {
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        backgroundColor: "#f7fafc",
        padding: "32px 0",
    },
    container: {
        maxWidth: "520px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "32px",
        border: "1px solid #e2e8f0",
    },
    heading: {
        color: "#111827",
        fontSize: "24px",
        fontWeight: 700,
        marginBottom: "16px",
    },
    paragraph: {
        color: "#4a5568",
        fontSize: "15px",
        lineHeight: "24px",
        margin: "12px 0",
    },
    buttonContainer: {
        textAlign: "center" as const,
        margin: "24px 0",
    },
    button: {
        backgroundColor: "#f97316",
        borderRadius: "8px",
        color: "#ffffff",
        fontWeight: 600,
        padding: "12px 24px",
        textDecoration: "none",
        display: "inline-block",
    },
    hr: {
        borderColor: "#e2e8f0",
        margin: "24px 0",
    },
    footer: {
        color: "#94a3b8",
        fontSize: "12px",
    },
};


