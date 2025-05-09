import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import WalletButton from '@/components/ui/wallet-button';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  formatNumber,
} from '@/libs/utils';
import {
  CREATE_TOKEN_FEE,
  MAX_TAGS,
  REVOKE_FREEZE_FEE,
  REVOKE_MINT_FEE,
  REVOKE_UPDATE_FEE,
  TOKEN_NAME_MAX_CHARS,
  TOKEN_SYMBOL_MAX_CHARS,
} from '@/libs/constants/token';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CreateTokenFormData } from '@/libs/validation/create-token';
import { DragAndDrop } from '@/components/ui/drag-and-drop';
import { TagsInput } from '@/components/ui/tags-input';
import {
  Shield,
  XCircle,
  PlusCircle,
  InfoIcon,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { ErrorResponseDto } from '@/libs/models';
import axios, { AxiosError } from 'axios';
import Spinner from '@/components/ui/spinner';
import {
  StoreTokenMetadaResponseDto,
} from '@/libs/models/token';
import { GetServerSideProps } from 'next';
import { WalletSendTransactionError } from '@solana/wallet-adapter-base';
import { database } from '@/libs/mongodb';
import { WALLET_COLLECTION, WalletDto } from '@/libs/models/wallet';
import { updateWalletToken } from '@/libs/utils/wallet';
import FrequentAnswersAndQuestions from '@/components/layout/frequent-answer-question';
import dotenv from 'dotenv';
import { createTokenFromContract, getProvider } from '@/components/services/blockchain';
import { BN } from '@coral-xyz/anchor';
import { convertAndResize } from '@/libs/utils/image';
import { TokenCreateWidgetProps } from '@/components/ui/token/creation-widget';
import { TokenCreateModal } from '@/components/ui/token/create-modal';

dotenv.config();

const Navbar = dynamic(() => import('@/components/layout/navbar'), {});
const Header = dynamic(() => import('@/components/layout/header'), {});
const Footer = dynamic(() => import('@/components/layout/footer'), {});

interface SSRCreateTokenPageProps {
  referralCode: string;
}

function CreateTokenPage({
  referralCode,
}: SSRCreateTokenPageProps) {
  const [schema, setSchema] = useState<
    typeof import('@/libs/validation/create-token').createTokenFormSchema | null
  >(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    setError,
    clearErrors,
    control,
    formState: { errors },
  } = useForm<CreateTokenFormData>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: {
      tokenName: '',
      tokenSymbol: '',
      tokenDecimals: '9',
      tokenSupply: '',
      tokenDescription: '',
      tags: [],
      revokeMint: true,
      revokeFreeze: true,
      immutable: true,
      customCreatorInfo: false,
      creatorName: 'SwapForge',
      creatorWebsite: 'https://swagforge.app',
      createSocial: false,
      socialWebsite: '',
      socialTwitter: '',
      socialTelegram: '',
      socialDiscord: '',
      socialInstagram: '',
      socialFacebook: '',
      tokenFee: CREATE_TOKEN_FEE,
    },
    mode: 'onChange',
  });

  const { connected, publicKey, sendTransaction, signTransaction } = useWallet();

  const tokenName = watch('tokenName');
  const tokenSymbol = watch('tokenSymbol');
  const tokenFee = watch('tokenFee');
  const tokenLogo = watch('tokenLogo');
  const revokeMint = watch('revokeMint');
  const revokeFreeze = watch('revokeFreeze');
  const immutable = watch('immutable');
  const customCreatorInfo = watch('customCreatorInfo');
  const createSocial = watch('createSocial');

  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(
    'Creating your token, please be patient!'
  );
  const [signature, setSignature] = useState<string>();
  const [open, setOpen] = useState<boolean>(false);
  const [tokenImageHover, setTokenImageHover] = useState<boolean>(false);
  const [token, setToken] = useState<TokenCreateWidgetProps | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const program = useMemo(() => getProvider(
    publicKey!,
    sendTransaction!,
    signTransaction!),
    [publicKey, sendTransaction, signTransaction])
  
  useMemo(() => {
    let totalFee = CREATE_TOKEN_FEE;
    if (revokeMint) {
      const sum = totalFee + REVOKE_MINT_FEE;
      totalFee = Number(sum.toFixed(6));
    }
    if (revokeFreeze) {
      const sum = totalFee + REVOKE_FREEZE_FEE;
      totalFee = Number(sum.toFixed(6));
    }
    if (immutable) {
      const sum = totalFee + REVOKE_UPDATE_FEE;
      totalFee = Number(sum.toFixed(6));
    }
    const sum = totalFee;
    setValue('tokenFee', sum);
  }, [immutable, revokeFreeze, revokeMint, setValue]);

  const onFileUpload = useCallback(
    async (file?: File) => {
      clearErrors('tokenLogo');
      try {
        const logoBase64 = await convertAndResize(file);
        setValue('tokenLogo', logoBase64);
      } catch (error) {
        setError('tokenLogo', {
          type: 'manual',
          message: (error as Error).message
        })
      }
    },
    [clearErrors, setError, setValue]
  );

  const onRemoveTokenLogo = useCallback(() => {
    const {
      tokenName,
      tokenSymbol,
      tokenDecimals,
      tokenSupply,
      tokenDescription,
      tags,
      revokeMint,
      revokeFreeze,
      immutable,
      customCreatorInfo,
      creatorName,
      creatorWebsite,
      createSocial,
      socialWebsite,
      socialTwitter,
      socialTelegram,
      socialDiscord,
      socialInstagram,
      socialFacebook,
      tokenFee,
    } = getValues();
    reset({
      tokenName,
      tokenSymbol,
      tokenDecimals,
      tokenSupply,
      tokenLogo: '',
      tokenDescription,
      tags,
      revokeMint,
      revokeFreeze,
      immutable,
      customCreatorInfo,
      creatorName,
      creatorWebsite,
      createSocial,
      socialWebsite,
      socialTwitter,
      socialTelegram,
      socialDiscord,
      socialInstagram,
      socialFacebook,
      tokenFee,
    });
  }, [getValues, reset]);

  const onSubmit = useCallback(
    async (createTokenFormData: CreateTokenFormData) => {
      try {
        setErrorMessage('');
        if (!connected || !publicKey) {
          toast.error('Please connect your wallet first.');
          return;
        }

        if (!program) {
          toast.error('No program initialized');
          return;
        }

        setTitle('Creating your token, please be patient!');
        setSignature('');
        setToken(undefined);
        setLoading(true);
        setOpen(true);

        const storeTokenMetadataResponse = await axios.post<StoreTokenMetadaResponseDto>(
          '/api/token/metadata/create',
          createTokenFormData
        );
        const { uri } = storeTokenMetadataResponse.data;

        const {
          tokenName,
          tokenSymbol,
          tokenDecimals,
          tokenSupply,
          revokeMint,
          revokeFreeze,
          immutable
        } = createTokenFormData;

        const { tx, mint } = await createTokenFromContract(
          program,
          publicKey,
          tokenName,
          tokenSymbol,
          Number(tokenDecimals),
          new BN(tokenSupply),
          uri,
          revokeMint,
          revokeFreeze,
          immutable
        )

        if (!tx) {
          toast.error('Create token failed!');
          throw Error('Create token failed!');
        }
        const signature = `https://solscan.io/tx/${tx}`;
        setSignature(signature);
        setTitle('Your token has been created!');
        setLoading(false);
        setToken({
          publicKey: mint,
          name: tokenName,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
          supply: tokenSupply,
          logo: tokenLogo
        });
        updateWalletToken(publicKey.toBase58(), mint, referralCode);
        reset();
        toast.success('Your token has been created!');
      } catch (error) {
        if (error instanceof WalletSendTransactionError) {
          if (error.message.includes('User rejected the request')) {
            toast.error('You rejected the transaction. Please try again.');
          } else {
            toast.error(error.message);
          }
        } else if (error instanceof AxiosError) {
          const axiosError = error as AxiosError;
          const data = axiosError.response?.data;
          toast.error((data as ErrorResponseDto)?.error);
          setErrorMessage((data as ErrorResponseDto)?.error);
        } else {
          console.log('error', error)
          toast.error((error as Error).message);
        }
        setOpen(false)
        setLoading(false);
      }
    },
    [connected, program, publicKey, referralCode, reset, tokenLogo]
  );

  useEffect(() => {
    import('@/libs/validation/create-token').then((module) => {
      setSchema(module.createTokenFormSchema);
    });
  }, []);

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      <Header
        isLanding={false}
        title='Create Your Token'
        subtitle='Easily create and manage tokens on the Solana blockchain.'
      />

      <Navbar />

      {token && <TokenCreateModal
        open={open}
        setOpen={setOpen}
        token={token}
        title={title}
        signature={signature}
        loading={loading}
      />}

      {/* Wallet Connection Button */}
      <div className='absolute right-4 top-4'>
        <WalletButton />
      </div>

      {/* Token Creation Form */}
      <div className='mx-auto flex max-w-6xl flex-col gap-6 px-4 py-20 md:flex-row'>
        <div className='order-2 flex flex-col md:order-1 md:w-2/3'>
          <h1 className='mb-8 text-center text-4xl font-bold'>
            Create Your Token
          </h1>
          <span className='mb-2 flex flex-row justify-center gap-1 text-sm'>
            <span>Referral Code</span>
            <span className='text-yellow-400'>{referralCode}</span>
          </span>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='border-1 flex flex-col rounded border-gray-500 p-3'
          >
            <div className='flex w-full flex-col justify-between gap-3 md:flex-row'>
              <div className='flex w-full flex-col gap-1'>
                <Label htmlFor='tokenName'>
                  Name <span className='text-red-500'>*</span>
                </Label>
                <Input
                  type='text'
                  id='tokenName'
                  {...register('tokenName')}
                  placeholder='Enter token name'
                />
                <div className='text-xs flex flex-row justify-between text-center italic'>
                  <span className='text-red-400'>
                    {errors.tokenName && <p>{errors.tokenName.message}</p>}
                  </span>
                  <span className='text-right'>
                    {tokenName?.length || 0}/{TOKEN_NAME_MAX_CHARS}
                  </span>
                </div>
              </div>

              <div className='flex w-full flex-col gap-1'>
                <Label htmlFor='tokenSymbol'>
                  Symbol <span className='text-red-500'>*</span>
                </Label>
                <Controller
                  name='tokenSymbol'
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      onChange={(e) => {
                        const transformed = e.target.value.toUpperCase().trim();
                        field.onChange(transformed);
                      }}
                      className='placeholder:text-muted-foreground h-9 w-full rounded-lg bg-gray-700 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400'
                      placeholder='Enter token symbol'
                    />
                  )}
                />
                <div className='text-xs flex flex-row justify-between text-center italic'>
                  <span className='text-red-400'>
                    {errors.tokenSymbol && <p>{errors.tokenSymbol.message}</p>}
                  </span>
                  <span className='text-right'>
                    {tokenSymbol?.length || 0}/{TOKEN_SYMBOL_MAX_CHARS}
                  </span>
                </div>
              </div>
            </div>

            <div className='flex w-full flex-col justify-between gap-3 md:flex-row'>
              <div className='flex w-full flex-col gap-1'>
                <Label htmlFor='tokenDecimals'>
                  Decimals <span className='text-red-500'>*</span>
                </Label>
                <Controller
                  name='tokenDecimals'
                  control={control}
                  defaultValue='6'
                  render={({ field }) => (
                    <input
                      {...field}
                      onChange={(e) => {
                        const formattedValue = formatNumber(e.target.value);
                        field.onChange(formattedValue);
                      }}
                      className='h-9 w-full rounded-lg bg-gray-700 p-3 text-right focus:outline-none focus:ring-2 focus:ring-yellow-400'
                      placeholder='Enter token decimals'
                    />
                  )}
                />
                {errors.tokenDecimals && (
                  <p className='text-xs text-left italic text-red-400'>
                    {errors.tokenDecimals.message}
                  </p>
                )}
              </div>

              <div className='flex w-full flex-col gap-1'>
                <Label htmlFor='tokenSupply'>
                  Token Supply <span className='text-red-500'>*</span>
                </Label>
                <Controller
                  name='tokenSupply'
                  control={control}
                  defaultValue='0'
                  render={({ field }) => (
                    <input
                      {...field}
                      onChange={(e) => {
                        // Format the input value
                        const formattedValue = formatNumber(e.target.value);
                        // Update the field value
                        field.onChange(formattedValue);
                      }}
                      className='h-9 w-full rounded-lg bg-gray-700 p-3 text-right focus:outline-none focus:ring-2 focus:ring-yellow-400'
                      placeholder='Enter token symbol'
                    />
                  )}
                />
                {errors.tokenSupply && (
                  <p className='text-xs text-left italic text-red-400'>
                    {errors.tokenSupply.message}
                  </p>
                )}
              </div>
            </div>

            <div className='mt-3 flex w-full flex-col justify-between gap-3 md:flex-row'>
              <div className='flex w-1/3 flex-col gap-1'>
                <Label htmlFor='tokenLogo'>
                  Token Logo <span className='text-red-500'>*</span>
                </Label>
                {tokenLogo ? (
                  <div
                    className='relative flex justify-start'
                    onMouseEnter={() => setTokenImageHover(true)}
                    onMouseLeave={() => setTokenImageHover(false)}
                  >
                    {tokenImageHover && (
                      <XCircle
                        onClick={onRemoveTokenLogo}
                        className='absolute right-4 top-1 h-4 w-4 cursor-pointer text-gray-400 hover:text-yellow-400'
                      />
                    )}
                    <Image
                      src={tokenLogo}
                      alt='tokenLogo'
                      width={200}
                      height={200}
                      className='rounded-md'
                    />
                  </div>
                ) : (
                  <DragAndDrop onFileUpload={onFileUpload} />
                )}
                {errors.tokenLogo && (
                  <p className='text-xs italic text-red-400'>
                    {errors.tokenLogo.message}
                  </p>
                )}
              </div>

              <div className='flex w-full flex-col gap-1'>
                <Label htmlFor='tokenDescription'>
                  Token Description <span className='text-red-500'>*</span>
                </Label>
                <Textarea
                  id='message'
                  {...register('tokenDescription')}
                  className='h-40'
                  placeholder='Type your message here.'
                />
                <div className='text-xs flex flex-row justify-between text-center italic'>
                  <span className='text-red-400'>
                    {errors.tokenDescription && (
                      <p>{errors.tokenDescription.message}</p>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className='mt-3 flex w-full flex-col justify-between gap-3 md:flex-row'>
              <div className='flex w-full flex-col gap-1'>
                <Label htmlFor='tokenLogo'>
                  Token Tags (Max {MAX_TAGS - 1})
                </Label>
                <Controller
                  name='tags'
                  control={control}
                  render={({ field }) => (
                    <>
                      <TagsInput
                        name={field.name}
                        value={field.value as string[]}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder='Type ENTER to save tags'
                        maxTags={MAX_TAGS}
                      />
                    </>
                  )}
                />
              </div>
            </div>

            <h2 className='mb-2 mt-3 flex items-center gap-2 text-xl text-gray-200'>
              <Shield className='h-8 w-8' /> Additional settings
            </h2>

            <div className='mb-6 flex w-full flex-col justify-between gap-2'>
              <div className='flex w-full flex-row items-center justify-between'>
                <div className='flex flex-row items-center gap-1'>
                  <Controller
                    name='revokeMint'
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label
                    htmlFor='revokeMint'
                    className='text block font-medium'
                  >
                    Revoke Mint Authority
                  </Label>
                </div>
                {revokeMint && (
                  <span className='text-xs text-yellow-400'>
                    {REVOKE_MINT_FEE} SOL
                  </span>
                )}
              </div>

              {revokeMint && (
                <Alert>
                  <Shield className='h-4 w-4' />
                  <AlertTitle className='text-xs'>Recommend!</AlertTitle>
                  <AlertDescription className='text-xs'>
                    Revoke right to mint new coins, this shows buyer of your
                    coin that supply is fixed and cannot grow. DEX scanners will
                    mark your coin as safe.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className='mb-6 flex w-full flex-col justify-between gap-2'>
              <div className='flex w-full flex-row items-center justify-between'>
                <div className='flex flex-row items-center gap-1'>
                  <Controller
                    name='revokeFreeze'
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label
                    htmlFor='revokeFreeze'
                    className='text block font-medium'
                  >
                    Revoke Freeze Authority
                  </Label>
                </div>
                {revokeFreeze && (
                  <span className='text-xs text-yellow-400'>
                    {REVOKE_FREEZE_FEE} SOL
                  </span>
                )}
              </div>

              {revokeFreeze && (
                <Alert>
                  <Shield className='h-4 w-4' />
                  <AlertTitle className='text-xs'>Recommend!</AlertTitle>
                  <AlertDescription className='text-xs'>
                    Revoke freeze right, you will make coin safer for potential
                    buyers of your coin and get more sales. DEX scanners will
                    mark your coin as safe.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className='mb-6 flex w-full flex-col justify-between gap-1'>
              <div className='flex w-full flex-row items-center justify-between gap-2'>
                <div className='flex flex-row items-center gap-1'>
                  <Controller
                    name='immutable'
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor='immutable' className='text block font-medium'>
                    Revoke Update
                  </Label>
                </div>
                {immutable && (
                  <span className='text-xs text-yellow-400'>
                    {REVOKE_UPDATE_FEE} SOL
                  </span>
                )}
              </div>

              {immutable && (
                <Alert>
                  <Shield className='h-4 w-4' />
                  <AlertTitle className='text-xs'>Recommend!</AlertTitle>
                  <AlertDescription className='text-xs'>
                    If your token is immutable it means you will not be able to
                    update token metadata
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className='mb-6 flex w-full flex-col justify-between gap-1'>
              <div className='flex w-full flex-row items-center justify-between gap-2'>
                <div className='flex flex-row items-center gap-1'>
                  <Controller
                    name='customCreatorInfo'
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor='customCreatorInfo'>
                    Customize Creator Information
                  </Label>
                </div>
                {customCreatorInfo && (
                  <span className='text-xs text-yellow-400'>Free</span>
                )}
              </div>

              {customCreatorInfo && (
                <div className='flex w-full flex-col justify-between gap-3 md:flex-row'>
                  <div className='flex w-full flex-col gap-1'>
                    <Label htmlFor='creatorName'>
                      Creator Name <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      type='text'
                      id='creatorName'
                      {...register('creatorName')}
                      placeholder='Customize creator name'
                    />
                    <div className='text-xs flex flex-row justify-between text-center italic'>
                      <span className='text-red-400'>
                        {errors.creatorName && (
                          <p>{errors.creatorName.message}</p>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className='flex w-full flex-col gap-1'>
                    <Label htmlFor='creatorWebsite'>
                      Creator Website <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      type='text'
                      id='creatorWebsite'
                      {...register('creatorWebsite')}
                      placeholder='Enter token symbol'
                    />
                    <div className='text-xs flex flex-row justify-between text-center italic'>
                      <span className='text-red-400'>
                        {errors.creatorWebsite && (
                          <p>{errors.creatorWebsite.message}</p>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {customCreatorInfo && (
                <Alert variant={'neutral'}>
                  <InfoIcon className='h-4 w-4' />
                  <AlertTitle className='text-xs'>Information!</AlertTitle>
                  <AlertDescription className='text-xs'>
                    Personalize your token contract address by customizing the
                    beginning or end—stand out with a unique touch!
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className='mb-6 flex w-full flex-col justify-between gap-1'>
              <div className='flex w-full flex-row items-center justify-between gap-2'>
                <div className='flex flex-row items-center gap-1'>
                  <Controller
                    name='createSocial'
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor='createSocial'>Customize Token Social</Label>
                </div>
                {createSocial && (
                  <span className='text-xs text-yellow-400'>Free</span>
                )}
              </div>

              {createSocial && (
                <>
                  <div className='flex w-full flex-col justify-between gap-3 md:flex-row'>
                    <div className='flex w-full flex-col gap-1'>
                      <Label htmlFor='socialWebsite'>Website</Label>
                      <Input
                        type='text'
                        id='socialWebsite'
                        {...register('socialWebsite')}
                        placeholder='https://www.mytoken.com'
                      />
                    </div>

                    <div className='flex w-full flex-col gap-1'>
                      <Label htmlFor='socialTwitter'>Twitter</Label>
                      <Input
                        type='text'
                        id='socialTwitter'
                        {...register('socialTwitter')}
                        placeholder='https://x.com/mytoken'
                      />
                    </div>
                  </div>

                  <div className='flex w-full flex-col justify-between gap-3 md:flex-row'>
                    <div className='flex w-full flex-col gap-1'>
                      <Label htmlFor='socialTelegram'>Telegram</Label>
                      <Input
                        type='text'
                        id='socialTelegram'
                        {...register('socialTelegram')}
                        placeholder='https://t.me/mytoken'
                      />
                    </div>

                    <div className='flex w-full flex-col gap-1'>
                      <Label htmlFor='socialDiscord'>Discord</Label>
                      <Input
                        type='text'
                        id='socialDiscord'
                        {...register('socialDiscord')}
                        placeholder='https://discord.com/mytoken'
                      />
                    </div>
                  </div>

                  <div className='flex w-full flex-col justify-between gap-3 md:flex-row'>
                    <div className='flex w-full flex-col gap-1'>
                      <Label htmlFor='socialInstagram'>Instagram</Label>
                      <Input
                        type='text'
                        id='socialInstagram'
                        {...register('socialInstagram')}
                        placeholder='https://t.me/mytoken'
                      />
                    </div>

                    <div className='flex w-full flex-col gap-1'>
                      <Label htmlFor='socialFacebook'>Facebook</Label>
                      <Input
                        type='text'
                        id='socialFacebook'
                        {...register('socialFacebook')}
                        placeholder='https://www.facebook.com/mytoken'
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {connected ? (
              <Button
                type='submit'
                disabled={loading}
                className='w-full cursor-pointer rounded-lg px-6 py-3 font-semibold transition duration-300'
              >
                {loading ? (
                  <Spinner />
                ) : (
                  <>
                    <PlusCircle className='mr-2 h-4 w-4' /> Create Token
                  </>
                )}
              </Button>
            ) : (
              <span className='flex w-full justify-center text-yellow-400'>
                Please connect your wallet! 
              </span>
            )}
          </form>
          <span className='text-xs mt-3 text-center italic text-yellow-400'>
            The cost of Token creation is {tokenFee} SOL, covering all fees!.
          </span>
          {errorMessage && (
            <span className='text-xs mt-3 text-center italic text-red-500'>
              {errorMessage}
            </span>
          )}
        </div>
        <div className='order-1 flex flex-col gap-3 md:order-2 md:w-1/3'>
          <h2 className='mb-5 text-center text-4xl font-bold'>How to use?</h2>
          <div className='border-1 flex flex-col gap-2 rounded border-gray-500 p-2 md:flex-row'>
            <span className='text-yellow-400'>Step 1</span>
            <span>Connect your Solana wallet</span>
          </div>
          <div className='border-1 flex flex-col gap-2 rounded border-gray-500 p-2 md:flex-row'>
            <span className='text-yellow-400'>Step 2</span>
            <span>Specify the desired name and symbol</span>
          </div>
          <div className='border-1 flex flex-col gap-2 rounded border-gray-500 p-2 md:flex-row'>
            <span className='text-yellow-400'>Step 3</span>
            <span>Select the decimals quantity</span>
          </div>
          <div className='border-1 flex flex-col gap-2 rounded border-gray-500 p-2 md:flex-row'>
            <span className='text-yellow-400'>Step 4</span>
            <span>Set the amount of suppliers</span>
          </div>
          <div className='border-1 flex flex-col gap-2 rounded border-gray-500 p-2 md:flex-row'>
            <span className='text-yellow-400'>Step 5</span>
            <span>Upload a 500x500 or less image</span>
          </div>
          <div className='border-1 flex flex-col gap-2 rounded border-gray-500 p-2 md:flex-row'>
            <span className='text-yellow-400'>Step 6</span>
            <span>Provide a brief description</span>
          </div>
          <div className='border-1 flex flex-col gap-2 rounded border-gray-500 p-2 md:flex-row'>
            <span className='text-yellow-400'>Step 7</span>
            <span>Add tags or keywords</span>
          </div>
          <div className='border-1 flex flex-col gap-2 rounded border-gray-500 p-2 md:flex-row'>
            <span className='text-yellow-400'>Step 8</span>
            <span>Click on Create Token</span>
          </div>
          <div className='border-1 flex flex-col gap-2 rounded border-gray-500 p-2 md:flex-row'>
            <span className='text-yellow-400'>Step 9</span>
            <span>Accept the transaction.</span>
          </div>
          <div className='border-1 flex justify-center gap-2 rounded border-gray-500 p-2 md:flex-row md:justify-start'>
            <span>Your token is ready 🚀🚀🚀</span>
          </div>
        </div>
      </div>

      <FrequentAnswersAndQuestions />

      <Footer />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<
  SSRCreateTokenPageProps
> = async (context) => {
  const referralCode = context.query?.referralCode as string;
  if (!referralCode) {
    return {
      redirect: {
        permanent: false,
        destination: '/create-token',
      },
      props: {},
    };
  }

  const wallet = await database
    .collection<WalletDto>(WALLET_COLLECTION)
    .findOne({
      referralCode,
    });

  if (!wallet?._id) {
    return {
      redirect: {
        permanent: false,
        destination: '/create-token',
      },
      props: {},
    };
  }

  return {
    props: {
      referralCode,
    },
  };
};

export default CreateTokenPage;
