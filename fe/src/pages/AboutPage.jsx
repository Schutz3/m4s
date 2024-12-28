import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
const AboutPage = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl pt-14 mt-10">
            <div className="bg-base-200 p-6 rounded-lg shadow-lg  pt-14">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-4">About Mail4Spam</h1>
                    <Mail className="inline-block size-16 mb-4" />
                </div>
                <p className="text-lg mb-4">
                    Mail4Spam is like tempmail, but with a twist. Your emails are securely stored in our database,
                    ensuring they don't disappear unless you choose to delete them.
                </p>

                <p className="text-lg mb-4">
                    With Mail4Spam, you can:
                </p>

                <ul className="list-disc list-inside mb-4 space-y-2">
                    <li>Use multiple domains with a single username</li>
                    <li>Access your emails anytime, anywhere</li>
                    <li>Easily manage and delete your emails when needed</li>
                    <li>Enjoy a clutter-free inbox without the permanence of a traditional email service</li>
                </ul>

                <p className="text-lg mb-4">
                    This makes Mail4Spam perfect for:
                </p>

                <ul className="list-disc list-inside mb-4 space-y-2">
                    <li>Signing up for temporary services</li>
                    <li>Testing email functionality in your applications</li>
                    <li>Protecting your primary email from potential spam</li>
                    <li>Managing multiple online identities</li>
                </ul>

                <p className="text-sm text-center">
                    About the <Link to="https://github.com/Schutz3">dev</Link>
                </p>
            </div>
        </div>
    );
};

export default AboutPage;