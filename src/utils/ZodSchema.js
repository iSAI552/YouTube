import zod from 'zod';

const zodSchema = zod.object({
    fullName: zod.string().min(3).max(100).nonempty(),
    email: zod.string().email(),
    username: zod.string().min(3).max(30).nonempty(),
    password: zod.string().min(8).max(30).nonempty()
});

export default zodSchema;